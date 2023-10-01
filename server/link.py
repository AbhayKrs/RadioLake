# !pip install pycristoforo shapely

import sys
import pycristoforo as pyc

input = sys.argv[1]
country = pyc.get_shape(input)
geoloc = pyc.geoloc_generation(country, 1000, input)
data_to_pass_back = []
for i, elem in enumerate(geoloc):
    data_to_pass_back.append(elem["geometry"]["coordinates"])
output = data_to_pass_back
print(output)

sys.stdout.flush()