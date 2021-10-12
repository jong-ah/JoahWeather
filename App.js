// StatusBar는 상태바와 소통한다. 시계, 배터리, 와이파이를 보여준다. 지워도 상관없다. 변화를 주고 싶으면 사용한다.
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Fontisto } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 원래대로라면 서버에 저장하겠지만, 교육용이고 무료로 생성 가능한 것이므로 여기에 적는다.
const API_KEY = 'e3882baac5cf3c79ab66b6e597de1e5a';

const icons = {
  Clouds: 'cloudy',
  Clear: 'day-sunny',
  Atmosphere: 'cloudy-gusts',
  Snow: 'snow',
  Rain: 'rains',
  Drizzle: 'rain',
  Thunderstorm: 'lighting',
};

export default function App() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    // 유저의 지리 정보를 얻을 수 있는지 확인한다.
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setOk(false);
    }

    // 유저의 지리 좌표를 얻는다.
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    // 유저의 지리 좌표를 가지고 도시명을 얻는다.
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );

    setCity(location[0].city);

    // open weather api에서 가져온 날짜 정보
    // 한국 온도로 표시하려면 끝에 'units=metric' 적어야한다. (기본 미국)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );

    const json = await response.json();

    // console.log로 결과를 확인하고 싶다면
    // 핸드폰 흔들어서 'stop remote debugging'을 누르고 브라우저 콘솔창에서 확인하면 된다.

    setDays(json.daily);
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: 'center' }}>
            {/* 로딩 표시, 운영체제마다 다름 */}
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.temp}>
                  {/*  소수점 한 자리만 나타나게 함 */}
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="black"
                />
              </View>

              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'orange',
  },
  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 58,
    fontWeight: '500',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  temp: {
    marginTop: 50,
    fontWeight: '600',
    fontSize: 100,
  },
  description: {
    marginTop: -10,
    fontSize: 30,
    fontWeight: '500',
  },
  tinyText: {
    marginTop: -5,
    fontSize: 25,
    fontWeight: '500',
  },
});

// StyleSheet.create를 쓰면 자동완성을 해준다.
// view는 기본으로 disply:flex이다.
// flex Direction 웹은 row가 기본, 앱은 column이 기본
// width, height을 대부분 안 쓰고 flex 비율을 사용한다.
// view가 하나만 있는 경우 수를 늘려도 1이다.
// 몇 개의 props는 운영체제별로 되는 것도 있고 안 되는 것도 있다.
