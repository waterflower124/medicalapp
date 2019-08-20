import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, } from 'react-native';
import {createStackNavigator} from "react-navigation"
import {YellowBox, 
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { SkypeIndicator } from 'react-native-indicators';

import Global from '../utils/Global/Global'


YellowBox.ignoreWarnings([
    'Module OAuthManager requires',
    ]);

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;

export default class Splash extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null
	};

	constructor(props){
		super();

		this.state = {
		  isVisible : true,
		  isReady: false,
		}
    }
    
    async componentWillMount() {
        setTimeout(async() => {

            let login = 0;

            try {
                let signin_status = await AsyncStorage.getItem("signin");
                
                if(signin_status == "ok") {
                    let email = await AsyncStorage.getItem("email");
                    let password = await AsyncStorage.getItem("password");

                    this.setState({showIndicator: true});
                    await fetch(Global.base_url + 'user/login', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            'email': email,
                            'password': password,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.status === 0) {
                            Alert.alert("Warning!", 'Email or Password is incorrect!');
                            
                        } else if(data.status === 1){
                            Global.user_token = data.token;
                            Global.email = data.data.email;
                            if(data.data.first_name != null) {
                                Global.first_name = data.data.first_name;
                            }
                            if(data.data.last_name != null) {
                                Global.last_name = data.data.last_name;
                            }
                            if(data.data.photo != null) {
                                Global.avatar_url = data.data.photo;
                            }
                            Global.created_at = data.data.created_on;
                            Global.user_loc_lat = parseFloat(data.data.latitude);
                            Global.user_loc_lng = parseFloat(data.data.longitude);
                            Global.user_current_address = data.data.location;
                            Global.username = data.data.username;
 
                            login = 1;
                        }
                        
                    })
                    .catch(function(error) {
                        Alert.alert('Warning!', 'Network error.');
                    });
                    
                    this.setState({showIndicator: false});
                    
                }
            } catch(error) {

            }
            if(login == 1) {
                this.props.navigation.navigate('Main');
            } else {
                this.props.navigation.navigate("SignIn");
            }
            
        }, 1000);
    }

    render() {
        return (
            <View style={styles.container}>
            {
                this.state.showIndicator &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                    <View style = {{flex: 1}}>
                        <SkypeIndicator color = '#ffffff' />
                    </View>
                </View>
            }
                <ImageBackground style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../assets/images/bg_splash.png')}>
                    <View style = {{width: '100%', height: deviceWidth * 0.6 * 1.4, alignItems: 'flex-end', marginTop: 40}}>
                        <Image style = {{width: deviceWidth * 0.6, height: deviceWidth * 0.6 * 1.4}} resizeMode = {'contain'} source = {require('../assets/images/credit_card.png')}></Image>
                    </View>
                    <View style = {{width: '100%', alignItems: 'center', marginBottom: 15}}>
                        <Text style = {{color: '#ff0000', fontSize: 38, fontFamily: 'Lato-Regular'}}>Wichz</Text>
                    </View>
                    <View style = {{width: '100%', alignItems: 'center'}}>
                        <Text style = {{color: '#8092A4', fontSize: 32, fontFamily: 'Lato-Regular', marginBottom: 10}}>Save more with</Text>
                        <Text style = {{color: '#8092A4', fontSize: 32, fontFamily: 'Lato-Regular', marginBottom: 10}}>discounts and cash back</Text>
                    </View>
                    <View style = {{width: '100%', height: 30, position: 'absolute', bottom: 40, left: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'Lato-Regular'}}>Discount</Text>
                        <View style = {{width: 1, height: 15, backgroundColor: '#ffffff', marginLeft: 5, marginRight: 5}}></View>
                        <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'Lato-Regular'}}>Awesome Offers</Text>
                        <View style = {{width: 1, height: 15, backgroundColor: '#ffffff', marginLeft: 5, marginRight: 5}}></View>
                        <Text style = {{color: '#ffffff', fontSize: 15, fontFamily: 'Lato-Regular'}}>Card Benefits</Text>
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    logo_style: {
        width: '70%',
		height: 300,
    }
});
