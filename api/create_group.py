"""
    This script creates a group of pokemons and returns jsonl of the group.

    An example of `config` is as follows (replace line breaks into '\n'):

        area: =[1, 3, 4]
        is_final_evolution: =true
        omosa: >=6.0, <=50.0

    The above example refers to Pokemons from Gen 1, Gen 3, and Gen 4 that are final evolutions and have a weight between 6.0 and 50.0.
"""

from flask import Flask, request, Response
import json
import os
import sys

app = Flask(__name__)

@app.route('/api/create_group', methods=['GET', 'POST'])
def create_group():
    if request.method == 'POST':
        data = request.get_json() or {}
        raw_config = data.get('config', '')
    else:
        raw_config = request.args.get('config', '')

    def compare_data(data1, data2, relation) -> bool:
        if relation == "=":
            return data1 == data2
        elif relation == ">":
            return data1 >= data2
        elif relation == "<":
            return data1 <= data2
        elif relation == "!":
            return data1 != data2
        else:
            print(f"💀 Error: Invalid config. You cannot use relation '{relation}='.", file=sys.stderr)
            exit(1)

    def cast(target):
        return int(str(target).replace(",", "")) if config_key in key_int else float(str(target).replace(",", "")) if config_key in key_float else True if config_key in key_boolean and str(target).lower() == "true" else False if config_key in key_boolean and str(target).lower() == "false" else target


    key_int     = ["id", "no", "sub", "area", "tokusei_1", "tokusei_2", "tokusei_3", "type_1", "type_2", "mega_flg", "genshi_flg", "kyodai_flg", "difficulty_easy_flg"]
    key_float   = ["omosa", "takasa"]
    key_boolean = ["is_final_evolution"]


    raw_config = raw_config.replace("\\n", "\n")

    config_list = raw_config.split("\n")
    config_list = [c for c in config_list if c != ""]

    print("Got config as follows:")
    print(config_list)

    file_path = os.path.join(os.path.dirname(__file__), "..", "public", "data", "irasutoya_data.jsonl")
    with open(file_path, "r") as f:
        raw_data = [json.loads(l) for l in f.readlines()]


    dropout_all = set()

    # Parse config contents
    for config_line in config_list:
        # Split into key and content
        try:
            config_key, raw_config_content = config_line.split(":")
            config_key = config_key.strip()
        except:
            print("💀 Error: Invalid config. You cannot use ':' in config contents.", file=sys.stderr)
            exit(1)

        # Extract relations
        config_content_list = raw_config_content.split("=")

        config_relation_list = ["=" if not content[-1] in [">", "<", "!"] else content[-1] for content in config_content_list[:-1]]
        config_content_list = [content.strip() if i == len(config_relation_list)-1 or relation == "=" else content[:-1].strip() for i, (content, relation) in enumerate(zip(config_content_list[1:], config_relation_list))]

        # Compare conditions
        for content, relation in zip(config_content_list, config_relation_list):
            if content[-1] == ",":
                content = content[:-1]
            if content[0] == "[" and content[-1] == "]":
                conditions = content[1:-1].split(",")
            else:
                conditions = [content]
            dropout_oneline = set(range(len(raw_data)))
            for condition in conditions:
                condition_cast = cast(condition.strip())
                dropout_oneline &= set(i for i, target in enumerate(raw_data) if not compare_data(cast(target[config_key]), condition_cast, relation))
            dropout_all |= dropout_oneline


    created_group = [l for i, l in enumerate(raw_data) if not i in dropout_all]
    jsonl_str = "\n".join(json.dumps(item, ensure_ascii=False) for item in created_group)
    print("Returned: ")
    print(jsonl_str)
    return Response(
        jsonl_str,
        mimetype="application/x-ndjson"
    )

if __name__ == "__main__":
    app.run(debug=True)
