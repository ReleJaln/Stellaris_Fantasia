import os
import re
from pathlib import Path

def replace_images_path(root_dir):
    root_dir = Path(root_dir)
    # 匹配的文件扩展名
    allowed_extensions = {'.js', '.json', '.wxml', '.wxss', '.html', '.css'}
    
    for file_path in root_dir.rglob('*'):
        if file_path.suffix.lower() in allowed_extensions and file_path.is_file():
            try:
                content = file_path.read_text(encoding='utf-8')
                # 使用正则替换，(?i)表示不区分大小写，\1保留原大小写
                new_content = re.sub(
                    r'(?i)(images/)', 
                    r'https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/', 
                    content
                )
                if new_content != content:
                    file_path.write_text(new_content, encoding='utf-8')
                    print(f"Updated: {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

# 使用示例
replace_images_path('./')  # 替换当前目录及子目录