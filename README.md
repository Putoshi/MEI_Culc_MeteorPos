
# Calculation position of meteor appearance
流星5ch電波干渉計システムから得られる仰角、方位角の数値を元に流星の出現位置を推定するAPI。
観測地点を原点とした、仰角、方位角情報を元に測地線長を出し、 Vincenty法アルゴリズムで緯度経度を求める。
また、GoogleMapAPIを使用して市町村名を取得し、AWS S3に観測データを保存する。

※ 流星の出現高度を100kmと仮定

API to determine the position of meteor appearance based on the elevation and azimuth values obtained from the meteor 5ch radio interferometer system.
The geodetic line length is calculated based on the elevation and azimuth information of the observation point as the origin, and the latitude and longitude are obtained using the Vincenty algorithm.
In addition, the names of cities, towns, and villages are obtained using GoogleMapAPI, and the observation data is stored in AWS S3.

The altitude of meteor appearance is assumed to be 100km.


## Command

### local develop
``$serverless offline``

### deploy dev
``$serverless deploy``

### deploy production
``$serverless deploy --stage production``


## URL Query

### develop
https://XXXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/dev/city?azimuth=10&elevation=10

### production
https://XXXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/production/city?azimuth=190&elevation=70