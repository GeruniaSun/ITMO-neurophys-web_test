# вот такая штука
тут я подшаманил над старым добрым тестом на сложную РДО _(наследие ОПД 2 сем)_
перебил там невероятный код батона и теперь:
- тест идет фиксированное время _(настраивается в `test.js`)_
- каждые __n__ минут скорость увеличивается _(настраивается в `test.js`)_
- каждую секунду мы пишем в массивом число ошибок и попаданий (попадания считаем раздельно для каждого шарика)

в конце просит ввести имя и отправляет данные в __InfluxDB__ (имя это _measurment_)

потому что инфлюх это круто модно + в нем можно строить графики (правда в бесплатном акке это как-то неудобно работает) +
можно скачать __csv__ и с ней в колабе поиграться

#### NB
если хотите превратить __CSV__ скчанную из __Influx Cloud__ в нормальный `pd.DataFrame` то стоит сделать вот так
```python
!pip install influxdb3-python
from influxdb_client_3 import InfluxDBClient3
import pandas

client = InfluxDBClient3(
  "https://eu-central-1-1.aws.cloud2.influxdata.com",
  database="BUCKET_NAME",
  token="API_TOKEN")

measurement = 'MEASUREMENT_NAME'
table = client.query(
  f'''SELECT *
    FROM {measurement}
    WHERE time >= now() - INTERVAL '90 days'
    ORDER BY time'''
)

client.close()
df = table.to_pandas()
df
```
---
##### буквально наша команда по нейрофизиологии:

![spice girls](./images/spice.gif)

