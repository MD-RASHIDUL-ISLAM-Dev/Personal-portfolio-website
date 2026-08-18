from __future__ import annotations

import csv
import gzip
import json
import mimetypes
import os
import re
import zipfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
OUT = ROOT / "performance_measurements.json"
PREVIOUS = Path("/home/ubuntu/Rifat-portfolio-v17.zip")
EXCLUDE_SUFFIXES = {".zip"}


def gzip_size(data: bytes) -> int:
    return len(gzip.compress(data, compresslevel=9))


def file_record(path: Path, root: Path) -> dict:
    data = path.read_bytes()
    record = {
        "path": str(path.relative_to(root)),
        "bytes": len(data),
        "gzip_bytes": gzip_size(data),
        "mime": mimetypes.guess_type(path.name)[0] or "application/octet-stream",
    }
    if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        try:
            with Image.open(path) as image:
                record["width"], record["height"] = image.size
                record["format"] = image.format
        except Exception as exc:
            record["image_error"] = str(exc)
    return record


def project_files(root: Path) -> list[Path]:
    return sorted(
        path for path in root.iterdir()
        if path.is_file() and path.suffix.lower() not in EXCLUDE_SUFFIXES and path.name != OUT.name
    )


def zip_records(zip_path: Path) -> dict | None:
    if not zip_path.exists():
        return None
    with zipfile.ZipFile(zip_path) as archive:
        files = [info for info in archive.infolist() if not info.is_dir()]
        total_uncompressed = sum(info.file_size for info in files)
        total_compressed = sum(info.compress_size for info in files)
        by_extension: dict[str, int] = {}
        for info in files:
            ext = Path(info.filename).suffix.lower() or "[no extension]"
            by_extension[ext] = by_extension.get(ext, 0) + info.file_size
        return {
            "path": str(zip_path),
            "zip_bytes": zip_path.stat().st_size,
            "entry_count": len(files),
            "uncompressed_bytes": total_uncompressed,
            "compressed_entry_bytes": total_compressed,
            "by_extension": dict(sorted(by_extension.items(), key=lambda item: item[1], reverse=True)),
        }


files = project_files(ROOT)
records = [file_record(path, ROOT) for path in files]
by_extension: dict[str, int] = {}
for record in records:
    ext = Path(record["path"]).suffix.lower() or "[no extension]"
    by_extension[ext] = by_extension.get(ext, 0) + record["bytes"]

html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "style.css").read_text(encoding="utf-8")
js = (ROOT / "script.js").read_text(encoding="utf-8")

previous_code = {}
if PREVIOUS.exists():
    with zipfile.ZipFile(PREVIOUS) as archive:
        previous_html = archive.read("index.html").decode("utf-8", errors="ignore")
        previous_css = archive.read("style.css").decode("utf-8", errors="ignore")
        previous_js = archive.read("script.js").decode("utf-8", errors="ignore")
        previous_code = {
            "index_html_bytes": len(previous_html.encode()),
            "style_css_bytes": len(previous_css.encode()),
            "script_js_bytes": len(previous_js.encode()),
            "html_ids": len(re.findall(r'\bid="[^"]+"', previous_html)),
            "forms": len(re.findall(r'<form\b', previous_html, flags=re.I)),
            "buttons": len(re.findall(r'<button\b', previous_html, flags=re.I)),
            "sections": len(re.findall(r'<section\b', previous_html, flags=re.I)),
        }

metrics = {
    "project": str(ROOT),
    "file_count": len(records),
    "raw_bytes": sum(record["bytes"] for record in records),
    "gzip_bytes_sum": sum(record["gzip_bytes"] for record in records),
    "by_extension_bytes": dict(sorted(by_extension.items(), key=lambda item: item[1], reverse=True)),
    "top_files": sorted(records, key=lambda record: record["bytes"], reverse=True)[:20],
    "previous_code": previous_code,
    "code": {
        "index_html_bytes": len(html.encode()),
        "style_css_bytes": len(css.encode()),
        "script_js_bytes": len(js.encode()),
        "sw_js_bytes": (ROOT / "sw.js").stat().st_size,
        "html_lines": html.count("\n") + 1,
        "css_lines": css.count("\n") + 1,
        "js_lines": js.count("\n") + 1,
        "html_ids": len(re.findall(r'\bid="[^\"]+"', html)),
        "forms": len(re.findall(r'<form\b', html, flags=re.I)),
        "buttons": len(re.findall(r'<button\b', html, flags=re.I)),
        "sections": len(re.findall(r'<section\b', html, flags=re.I)),
    },
    "previous_v17": zip_records(PREVIOUS),
    "current_v19_zip": zip_records(Path("/home/ubuntu/Rifat-portfolio-v19.zip")),
}

OUT.write_text(json.dumps(metrics, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(metrics, indent=2, ensure_ascii=False))
print(f"saved={OUT}")
