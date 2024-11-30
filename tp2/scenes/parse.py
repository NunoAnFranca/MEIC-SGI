import json

def lowercase_keys(data):
    if isinstance(data, dict):
        return {k.lower(): lowercase_keys(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [lowercase_keys(item) for item in data]
    else:
        return data

def parse_and_lowercase_json(input_file, output_file):
    with open(input_file, 'r') as f:
        json_data = json.load(f)
    
    lowercased_data = lowercase_keys(json_data)

    with open(output_file, 'w') as f:
        json.dump(lowercased_data, f, indent=4)

# Example usage:
input_file = 'super_mario.json'  # Replace with your input file path
output_file = 'super_mario_lc.json'  # Replace with your desired output file path

parse_and_lowercase_json(input_file, output_file)
