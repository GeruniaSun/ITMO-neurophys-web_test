# вот такая штука
тут я подшаманил над старым добрым тестом на сложную РДО _(наследие ОПД 2 сем)_
перебил там невероятный код батона и теперь:
- тест идет фиксированное время _(настраивается в `test.js`)_
- каждые __n__ минут скорость увеличивается _(настраивается в `test.js`)_
- каждую секунду мы пишем в массив число ошибок и попаданий
    _(попадания считаем раздельно для каждого шарика)_
- также пишем в резы сколько полных оборотов было на каждом шарике
    _(так ошибки тоже можно было для каждого отдельно посчитать)_
- в конце просит ввести имя и отправляет данные в __InfluxDB__ (имя это _measurment_)
- локально сохраняет CSV файл названый введенным именем

почему инфлюх? потому что инфлюх это круто модно + в нем можно строить графики
_(правда в бесплатном акке это как-то неудобно работает)_

#### NB
если хотите превратить __CSV__ скачанную из __Influx Cloud__ в нормальный `pd.DataFrame` то стоит сделать вот так
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



