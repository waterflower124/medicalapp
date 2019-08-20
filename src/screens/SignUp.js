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
    Linking
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { SkypeIndicator } from 'react-native-indicators';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MapView from 'react-native-maps';

import Global from '../utils/Global/Global'

// YellowBox.ignoreWarnings(["Require cycle:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;

export default class SignUp extends Component {
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

          email: '',
          password: '',
          username: '',
          showPassword: false,
          accep_terms: false,
          selectedAddress: '',
          
          selectedLat: 0.0,
          selectedLng: 0.0,
		}
    };
    
    async componentWillMount() {
        // this.requestAccess();
        
    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initMapView.bind(this));

    }

    // componentWillUnmount() {
    //     navigator.geolocation.clearWatch(this.watchID);
    // }

    initMapView() {
        if(Global.selectedLat != 0.0 || Global.selectedLng != 0.0) {
            this.setState({
                selectedLat: Global.selectedLat,
                selectedLng: Global.selectedLng
            })
            this.getcurrent_address(Global.selectedLat, Global.selectedLng);
        }
    }

    // requestAccess = async () => {
    //     if(Platform.OS == "android") {
    //         try {
    //             const granted = await PermissionsAndroid.request(
    //                 PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //                 {
    //                     'title': 'Location Permission',
    //                     'message': 'Wichz would like to access your location to get your things.'
    //                 }
    //             )
    //             if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //                 // console.warn("You can use locations ")
    //             } else {
    //                 // console.warn("Location permission denied")
    //             }
    //         } catch (err) {
    //             // console.warn(err)
    //         }
    //     }
    //     this.watchID = navigator.geolocation.watchPosition((position) => {
    //         this.setState({
    //             selectedLat: position.coords.latitude,
    //             selectedLng: position.coords.longitude
    //         });
    //         Global.selectedLat = position.coords.latitude;
    //         Global.selectedLng = position.coords.longitude;
    //         this.getcurrent_address(position.coords.latitude, position.coords.longitude);
    //     }, (error)=>console.log(error.message),
    //     {enableHighAccuracy: false, timeout: 3, maximumAge: 1, distanceFilter: 1}
    //     );
    // }

    getcurrent_address = async(currentLat, currentLng) => {
        await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + currentLat + ',' + currentLng + '&key=' + Global.MAPAPIKEY)
        .then(response => response.json())
        .then(data => {
            if(data.status == "OK") {
                this.setState({
                    selectedAddress: data.results[0].formatted_address
                })
            } else {
                // console.warn("error.message")
            }
        })
        .catch(function(error) {
            console.log(error);
            Alert.alert('Warning!', 'Network error!');
        });
    }

    handleUsername = (typedText) => {
        this.setState({
            username: typedText
        });
    };

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

    select_location() {
        this.props.navigation.navigate("LocationSelection", {selectedLat: this.state.selectedLat, selectedLng: this.state.selectedLng});
    }

    open_prevacy() {
        var privacy_link = "http://wichz.com/Legal_Privacy"
        Linking.canOpenURL(privacy_link).then(supported => {
            if (supported) {
                Linking.openURL(privacy_link);
            } else {
                this.refs.toast.show("This card don't provide link");
            }
        });
    }

    signup = async() => {
        Keyboard.dismiss();
        if(!this.state.accep_terms) {
            Alert.alert("Warning!", 'Please accept terms and privacy policy.');
            return;
        }
        if(this.state.username == "" ) {
            Alert.alert("Warning!", 'Password input username.');
            return;
        };
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
        await fetch(Global.base_url + 'user/sign_up', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'username': this.state.username,
                'email': this.state.email,
                'password': this.state.password,
                'location': this.state.selectedAddress,
                'lat': this.state.selectedLat,
                'lng': this.state.selectedLng
            })
        })
        .then(response => response.json())
        .then(async data => {
            if(data.status == 0) {
                Alert.alert("Warning!", 'Then email is already exist.');
            } else if(data.status === 1){
                // Global.token = data.token;
                // if(this.state.accep_terms) {

                // }
                // this.props.navigation.navigate('Main');
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network error.');
        });
        
        this.setState({showIndicator: false});
    };

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
                <ImageBackground style = {styles.background_view} resizeMode = {'stretch'} source = {require('../assets/images/bg_signup.png')}>
                    <View style = {styles.main_view}>
                        <KeyboardAwareScrollView style = {{flex: 1}}>
                            <View style = {styles.title_view}>
                                <Text style = {{color: '#072B4F', fontSize: 24, fontFamily: 'Lato-Regular'}}>Sign Up</Text>
                            </View>
                            <View style= {styles.comment_view}>
                                <Text style = {[styles.input_title_text, {height: '50%'}]}>Create your account</Text>
                            </View>
                            <View style = {styles.input_view}>
                                <Text style = {styles.input_title_text}>Username*</Text>
                                <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Username' onChangeText = {this.handleUsername}>{this.state.username}</TextInput>
                            </View>
                            <View style = {styles.input_view}>
                                <Text style = {styles.input_title_text}>Email*</Text>
                                <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Email' onChangeText = {this.handleEmail}>{this.state.email}</TextInput>
                            </View>
                            <View style = {styles.input_view}>
                                <Text style = {styles.input_title_text}>Password*</Text>
                                <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Password' secureTextEntry = {true} onChangeText = {this.handlePassword}>{this.state.password}</TextInput>
                            </View>
                            {/* <View style = {styles.input_view}>
                                <Text style = {styles.input_title_text}>Your location</Text>
                                <View style = {{width: '100%', height: '50%', flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style = {[styles.input_text, {width: '90%'}]} numberOfLines = {1} renderTruncatedFooter = {() => null}>{this.state.selectedAddress}</Text>
                                    <View style = {{width: '10%', height: '100%'}}>
                                        <TouchableOpacity style = {{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.select_location()}>
                                            <Image style = {{width: '100%', height: '70%'}} resizeMode = {'contain'} source = {require('../assets/images/signup_location.png')}></Image>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View> */}
                            <View style = {styles.accep_termsview}>
                                <TouchableOpacity style = {styles.keepsigin_button} onPress = {() => this.setState({accep_terms: !this.state.accep_terms})}>
                                {
                                    this.state.accep_terms &&
                                    <Image style = {{width: '80%', height: '80%'}} resizeMode = {'contain'} source = {require('../assets/images/keepsignin_check.png')}></Image>
                                }
                                </TouchableOpacity>
                                <TouchableOpacity onPress = {() => this.open_prevacy()}>
                                    <Text style = {{color: '#000000', fontSize: 12, fontFamily: 'Lato-Regular', marginLeft: 5}}>I accept terms and privacy policies</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {styles.signup_view}>
                                <TouchableOpacity style = {styles.signup_button} onPress = {() => this.signup()}>
                                    <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Sign Up</Text>
                                </TouchableOpacity>
                                <View style = {styles.signin_view}>
                                    <Text style = {{color: '#808080', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Already register?</Text>
                                    <TouchableOpacity onPress = {() => this.props.navigation.navigate('SignIn')}>
                                        <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                    {/* <View style = {styles.signup_view}>
                        <TouchableOpacity style = {styles.signup_button} onPress = {() => this.signup()}>
                            <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Sign Up</Text>
                        </TouchableOpacity>
                        <View style = {styles.signin_view}>
                            <Text style = {{color: '#808080', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Already register?</Text>
                            <TouchableOpacity onPress = {() => this.props.navigation.navigate('SignIn')}>
                                <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View> */}
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
    background_view: {
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    main_view: {
        width: '80%',
        height: '80%',
        position: 'absolute',
        top: deviceHight * 0.15,
        left: deviceWidth * 0.1,
        bottom: 150
    },
    title_view: {
        width: '80%', 
        height: 50, 
        justifyContent: 'center'
    },
    comment_view: {
        width: '80%', 
        height: 50, 
        justifyContent: 'center',
        marginTop: 10
    },
    input_title_text: {
        width: '100%', 
        height: '50%', 
        color: '#808080', 
        fontSize: 18, 
        fontFamily: 'Lato-Regular', 
    },
    input_view: {
        width: '100%', 
        height: 60, 
        borderBottomColor: '#808080', 
        borderBottomWidth: 1, 
        // justifyContent: 'center', 
        alignItems: 'stretch',
        marginBottom: 10
    },
    input_text: {
        width: '100%', 
        height: '50%', 
        color: '#072B4F', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular', 
        padding: 0,
    },
    accep_termsview: {
        width: '100%', 
        height: 20, 
        alignItems: 'center', 
        flexDirection: 'row'
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
    signup_view: {
        width: '100%', 
        height: 80, 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        marginTop: 20
        // position: 'absolute',
        // bottom: 50,
        // left: 0
    },
    signup_button: {
        width: '80%', 
        height: '50%', 
        borderRadius: 10, 
        borderColor: '#000000', 
        borderWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    signin_view: {
        width: '100%', 
        height: '50%', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'row',
    }
});
