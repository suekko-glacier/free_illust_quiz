import os
import json

# フォルダパス
image_dir = 'public/irasutoya_images'
data_file = 'public/data/irasutoya_data.jsonl'

# 画像ファイルを取得
images = [f for f in os.listdir(image_dir) if f.endswith('.png')]

# JSONLを作成
data = []
for img in images:
    # nameを抽出: "のイラスト.png" を除く
    if 'のイラスト.png' in img:
        name = img.replace('のイラスト.png', '')
    else:
        name = img.replace('.png', '')
    data.append({'name': name, 'image': img})

# JSONLに書き出す
with open(data_file, 'w', encoding='utf-8') as f:
    for item in data:
        f.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"Updated {data_file} with {len(data)} items.")