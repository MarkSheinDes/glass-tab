"""Собирает zip для магазинов (без store/, tools/, dist/).
Два пакета: для Chrome / Edge / Opera / Yandex и для Firefox (тот же код, манифест дополнен настройками Firefox)."""
import json, os, zipfile

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manifest = json.load(open(os.path.join(root, 'manifest.json'), encoding='utf-8'))
ver = manifest['version']
include = ['newtab.html', 'LICENSE', 'css', 'js', 'icons', '_locales']
out_dir = os.path.join(root, 'dist')
os.makedirs(out_dir, exist_ok=True)
for f in os.listdir(out_dir):
    if f.startswith('GlassTab-') and f.endswith('.zip'):
        os.remove(os.path.join(out_dir, f))


def build(name, manifest_data):
    out = os.path.join(out_dir, name)
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('manifest.json', json.dumps(manifest_data, indent=2, ensure_ascii=False) + '\n')
        for item in include:
            p = os.path.join(root, item)
            if os.path.isdir(p):
                for d, _, files in os.walk(p):
                    for f in files:
                        full = os.path.join(d, f)
                        z.write(full, os.path.relpath(full, root).replace(os.sep, '/'))
            else:
                z.write(p, item)
    print('OK', name, round(os.path.getsize(out) / 1024), 'KB')


build(f'GlassTab-{ver}.zip', manifest)

# Firefox: нужен идентификатор расширения и заявление о данных (город, введённый пользователем, уходит погодному сервису)
ff = json.loads(json.dumps(manifest))
ff['browser_specific_settings'] = {'gecko': {
    'id': 'glass-tab@glasstab.app',
    'strict_min_version': '140.0',
    'data_collection_permissions': {'required': ['locationInfo']}
}, 'gecko_android': {'strict_min_version': '142.0'}}
build(f'GlassTab-{ver}-firefox.zip', ff)
