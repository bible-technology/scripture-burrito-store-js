#!/usr/bin/env python3

import json, sys

with open(sys.argv[1], 'r') as fp:
    data = json.load(fp)
prettified = json.dumps(data, indent=4)
with open(sys.argv[1], 'w') as fp:
    fp.write(prettified)
    fp.write("\n")
