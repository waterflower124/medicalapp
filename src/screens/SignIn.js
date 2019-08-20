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
    PermissionsAndroid,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { SkypeIndicator } from 'react-native-indicators';
import moment from 'moment';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import AsyncStorage from '@react-native-community/async-storage';

import Global from '../utils/Global/Global'

// YellowBox.ignoreWarnings(["Require cycle:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;

 

export default class SignIn extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null
	};

	constructor(props){
		super();

		this.state = {
            isVisible : true,
            isReady: false,
            showIndicator: false,

            email: 'test@email.com',
            password: 'wwwwwwww',
            // email: '',
            // password: '',
            showPassword: false,
            keep_signin: false,
		}
    };
    
    async componentDidMount() {
        this.requestAccess();
    };

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    requestAccess = async () => {
        if(Platform.OS == "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'Location Permission',
                        'message': 'Wichz would like to access your location to get your things.'
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // console.warn("You can use locations ")
                } else {
                    // console.warn("Location permission denied")
                }
            } catch (err) {
                console.warn(err.message)
            }
        }
        this.watchID = navigator.geolocation.watchPosition((position) => {
            this.setState({
                user_lat: position.coords.latitude,
                user_lng: position.coords.longitude
            });
            Global.selectedLat = position.coords.latitude;
            Global.selectedLng = position.coords.longitude;
        }, (error)=>console.log(error.message),
        {enableHighAccuracy: false, timeout: 3, maximumAge: 1, distanceFilter: 1}
        );
    }

    handleEmail = (typedText) => {
        this.setState({
            email: typedText
        });
    };

    handlePassword = (typedText) => {
        this.setState({
            password: typedText
        });
    };

    signin = async() => {
        Keyboard.dismiss();
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            Alert.alert("Warning!", 'Please use valid Email address.');
            return;
        };
        if(this.state.password.length < 8 ) {
            Alert.alert("Warning!", 'Password have to be at least 8 characters.');
            return;
        };

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'user/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'email': this.state.email,
                'password': this.state.password,
            })
        })
        .then(response => response.json())
        .then(async data => {
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
                if(this.state.keep_signin) {
                    try {
                        await AsyncStorage.setItem("signin", "ok");
                        await AsyncStorage.setItem("email", this.state.email);
                        await AsyncStorage.setItem("password", this.state.password);
                    } catch(error) {
                        console.warn(error.message);
                    }
                }
                this.props.navigation.navigate('Main');
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network error.');
        });
        
        this.setState({showIndicator: false});
    };

    

    google_login = async() => {
   
        this.setState({showIndicator: true});
        GoogleSignin.configure({
            iosClientId: '36209462086-qrg9ld4mr3d67voaal5mp8nvgjlr5i1q.apps.googleusercontent.com',
            webClientId: "36209462086-u02m4qmltchgk72ae3lpmmgvcf42qrqu.apps.googleusercontent.com"
        });
        try {
            await GoogleSignin.hasPlayServices();
            const user_info = await GoogleSignin.signIn()
            
            await fetch(Global.base_url + 'user/login_social', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'email': user_info.user.email,
                    'username': user_info.user.name,
                    'location': 'User location',
                    'lat': this.state.user_lat,
                    'lng': this.state.user_lng,
                    'social_type': 'google',
                    'social_id': user_info.idToken
                })
            })
            .then(response => response.json())
            .then(async data => {
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

                    Global.avatar_url = user_info.user.photo;
                    Global.created_at = data.data.created_on;
                    Global.user_loc_lat = parseFloat(data.data.latitude);
                    Global.user_loc_lng = parseFloat(data.data.longitude);
                    Global.user_current_address = data.data.location;
                    Global.username = data.data.username;
                    if(this.state.keep_signin) {
                       
                    }
                    await AsyncStorage.setItem("signin", "social");
                    this.props.navigation.navigate('Main');
                }
                
            })
            .catch(function(error) {
                Alert.alert('Warning!', 'Network error.');
            });

        } catch(error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                console.warn("cancelled login");
            } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (f.e. sign in) is in progress already
                console.warn("already in progress");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
                console.warn("play service is not allowed");
            } else {
            // some other error happened
                console.warn("other error");
            }
            Alert.alert('Warning!', 'Error occured.');
        }

        this.setState({showIndicator: false});
        
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
            {
                this.state.showIndicator &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                    <View style = {{flex: 1}}>
                        <SkypeIndicator color = '#ffffff' />
                    </View>
                </View>
            }
                <ImageBackground style = {styles.background_view} resizeMode = {'stretch'} source = {require('../assets/images/bg_signin.png')}>
                    <View style = {{width: '80%', height: 350}}>
                        <View style = {styles.opacity_view}></View>
                        <View style = {styles.signin_view}>
                            <View style = {styles.title_view}>
                                <Text style = {{color: '#072B4F', fontSize: 24, fontFamily: 'Lato-Regular'}}>Login</Text>
                            </View>
                            <View style = {styles.content_view}>
                                <View style = {[styles.input_view, {marginBottom: 20}]}>
                                    <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Email' onChangeText = {this.handleEmail}>{this.state.email}</TextInput>
                                </View>
                                <View style = {[styles.input_view, {flexDirection: 'row'}]}>
                                    <TextInput style = {[styles.input_text, {width: '90%'}]} autoCapitalize = 'none' placeholder = 'Password' secureTextEntry = {!this.state.showPassword} onChangeText = {this.handlePassword}>{this.state.password}</TextInput>
                                    <View styles = {{width: '10%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                    <TouchableOpacity onPress = {() => this.setState({showPassword: !this.state.showPassword})}>
                                    {
                                        this.state.showPassword &&
                                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../assets/images/password_show.png')}></Image>
                                    }
                                    {
                                        !this.state.showPassword &&
                                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../assets/images/password_hide.png')}></Image>
                                    }    
                                    </TouchableOpacity>
                                    </View>
                                </View>
                                <View style = {styles.keep_signinview}>
                                    <TouchableOpacity style = {{width: 120, height: '100%', flexDirection: 'row', alignItems: 'center'}} onPress = {() => this.setState({keep_signin: !this.state.keep_signin})}>
                                        <View style = {styles.keepsigin_button}>
                                        {
                                            this.state.keep_signin &&
                                            <Image style = {{width: 10, height: 10}} resizeMode = {'contain'} source = {require('../assets/images/keepsignin_check.png')}></Image>
                                        }
                                        </View>
                                        <Text style = {{color: '#000000', fontSize: 12, fontFamily: 'Lato-Regular', marginLeft: 5}}>Keep me logged in</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style = {styles.signin_buttonview}>
                                    <TouchableOpacity style = {styles.signin_button} onPress = {() => this.signin()}>
                                        <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Login</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style = {{width: '100%', height: 20, alignItems: 'flex-end'}}>
                                    <TouchableOpacity onPress = {() => this.props.navigation.navigate('ForgotPassword')}>
                                        <Text style = {{color: '#808080', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Forgot password?</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style = {styles.signup_view}>
                                <Text style = {{color: '#808080', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Not registered?</Text>
                                <TouchableOpacity onPress = {() => this.props.navigation.navigate('SignUp')}>
                                    <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Sign up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.social_view}>
                        <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Or Login with</Text>
                        <View style = {{width: '100%', height: 40, marginTop: 20, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                            <TouchableOpacity onPress = {() => this.google_login()}>
                                <Image style = {{width: 40, height: 40}} resizeMode = {'contain'} source = {require('../assets/images/social_google.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image style = {{width: 40, height: 40}} resizeMode = {'contain'} source = {require('../assets/images/social_facebook.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image style = {{width: 40, height: 40}} resizeMode = {'contain'} source = {require('../assets/images/social_twitter.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
            </TouchableWithoutFeedback>
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
    background_view: {
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    opacity_view: {
        width: '100%', 
        height: '100%',
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 10, 
        backgroundColor: '#ffffff', 
        opacity: 0.3,
        // borderColor:'#000000', // if you need 
        borderWidth:1,
        // overflow: 'hidden',
        shadowColor: '#c0c0c0',
        shadowRadius: 20,
        shadowOpacity: 0.3,
    },
    signin_view: {
        width: '100%', 
        height: '100%',
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 10, 
        position: 'absolute',
        top: 0,
        left: 0
    },
    title_view: {
        width: '80%', 
        height: '15%', 
        justifyContent: 'center'
    },
    content_view: {
        width: '80%', 
        height: '55%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    input_view: {
        width: '100%', 
        height: 30, 
        borderBottomColor: '#808080', 
        borderBottomWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    input_text: {
        width: '100%', 
        height: '100%', 
        color: '#072B4F', 
        fontSize: 18, 
        fontFamily: 'Lato-Regular', 
        padding: 0
    },
    keep_signinview: {
        width: '100%', 
        height: 20, 
        justifyContent: 'center', 
        
    },
    keepsigin_button: {
        width: 12, 
        height: 12, 
        borderRadius: 12, 
        borderColor: '#ff0000', 
        borderWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    signin_buttonview: {
        width: '100%', 
        height: 50, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 20
    },
    signin_button: {
        width: '100%', 
        height: '80%', 
        borderRadius: 10, 
        borderColor: '#000000', 
        borderWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    signup_view: {
        width: '80%', 
        height: '30%', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'row'
    },
    social_view: {
        width: 150,
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 50,
        left: (deviceWidth - 150) / 2
    }
});
