import json
import subprocess
import time
import urllib.request
from websocket import create_connection

url = 'http://127.0.0.1:4183/?v21cdp=1'
proc = subprocess.Popen([
    'chromium', '--headless', '--no-sandbox', '--disable-gpu',
    '--window-size=390,844', '--remote-debugging-port=9229', '--remote-allow-origins=*',
    '--user-data-dir=/tmp/rifat-v21-cdp', url
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    time.sleep(1.5)
    targets = json.load(urllib.request.urlopen('http://127.0.0.1:9229/json'))
    page = next(item for item in targets if item.get('type') == 'page')
    ws = create_connection(page['webSocketDebuggerUrl'], origin='http://localhost:9229')
    counter = 0
    def evaluate(expression):
        nonlocal_counter = None
        global counter
        counter += 1
        ws.send(json.dumps({'id': counter, 'method': 'Runtime.evaluate', 'params': {'expression': expression, 'returnByValue': True}}))
        while True:
            result = json.loads(ws.recv())
            if result.get('id') == counter:
                return result.get('result', {}).get('result', {}).get('value')
    expression = r'''(() => {
      const menuButton = document.querySelector('#menu-toggle');
      const menu = document.querySelector('#site-menu');
      const mobileTools = document.querySelector('#site-nav-mobile-tools');
      const desktopTools = document.querySelector('.site-nav__tools');
      const theme = document.querySelector('#theme-toggle');
      const before = {
        width: window.innerWidth,
        menuPosition: getComputedStyle(menu).position,
        desktopToolsDisplay: getComputedStyle(desktopTools).display,
        mobileToolsDisplay: getComputedStyle(mobileTools).display,
        mobileToolsChildren: mobileTools.children.length,
        menuButtonRight: Math.round(menuButton.getBoundingClientRect().right),
        menuButtonTop: Math.round(menuButton.getBoundingClientRect().top)
      };
      menuButton.click();
      const open = {
        ariaExpanded: menuButton.getAttribute('aria-expanded'),
        menuOpen: menu.classList.contains('is-open'),
        bodyLocked: document.body.classList.contains('menu-open'),
        menuRect: {top: Math.round(menu.getBoundingClientRect().top), bottom: Math.round(menu.getBoundingClientRect().bottom), right: Math.round(menu.getBoundingClientRect().right)},
        utilityLabels: [...mobileTools.querySelectorAll('button')].map(node => node.id)
      };
      menuButton.click();
      const closed = {ariaExpanded: menuButton.getAttribute('aria-expanded'), menuOpen: menu.classList.contains('is-open'), bodyLocked: document.body.classList.contains('menu-open')};
      theme.click();
      const light = {theme: document.documentElement.dataset.theme, navColor: getComputedStyle(document.querySelector('.site-nav__links a')).color, navBackground: getComputedStyle(menu).backgroundColor, contactColor: getComputedStyle(document.querySelector('.contact-links a')).color, utilityColor: getComputedStyle(document.querySelector('#theme-toggle')).color, titleColor: getComputedStyle(document.querySelector('.section-title')).color, bodyCopyColor: getComputedStyle(document.querySelector('.body-copy')).color};
      theme.click();
      return {before, open, closed, light};
    })()'''
    print(json.dumps(evaluate(expression), ensure_ascii=False, indent=2))
finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except subprocess.TimeoutExpired:
        proc.kill()
