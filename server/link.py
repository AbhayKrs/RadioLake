# !pip install pycristoforo shapely

import sys
import pycristoforo as pyc
import ast #abstract syntax tree

input = ast.literal_eval(sys.argv[1])
country = pyc.get_shape(input['country'])
geoloc = pyc.geoloc_generation(country, int(input['count']), input['country'])
data_to_pass_back = []
for i, elem in enumerate(geoloc):
    data_to_pass_back.append(elem["geometry"]["coordinates"])
output = data_to_pass_back
print(output)

sys.stdout.flush()