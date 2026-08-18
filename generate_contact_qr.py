from pathlib import Path
import qrcode

payload = 'https://www.mdrashidulislam.kdns.fr/#contact'
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=4)
qr.add_data(payload)
qr.make(fit=True)
image = qr.make_image(fill_color='#102033', back_color='#f4efdf').convert('RGB')
image = image.resize((192, 192))
image.save(Path('/home/ubuntu/workspace/portfolio-upgrade/contact-qr.png'), optimize=True)
print(payload)
print('/home/ubuntu/workspace/portfolio-upgrade/contact-qr.png')
