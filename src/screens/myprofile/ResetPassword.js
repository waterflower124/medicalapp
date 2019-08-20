import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, } from 'react-native';
import {createStackNavigator} from "react-navigation"
import {YellowBox, 
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Platform, 
    ScrollView,
    TextInput,
    StatusBar
} from 'react-native';


import { SkypeIndicator } from 'react-native-indicators';
import moment from 'moment';
import ToggleSwitch from '../../utils/component/togglebutton/ToggleSwitch'

import Global from '../../utils/Global/Global'
import {getInset} from 'react-native-safe-area-view'

const bottomOffset = getInset('bottom');

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topviewHeight = Platform.OS == 'android' ? 80 - StatusBar.currentHeight : 80;
var tabbarHeight = 50
var main_viewHeight = Platform.OS == 'android' ? deviceHeight - topviewHeight - (tabbarHeight + 5) - StatusBar.currentHeight : deviceHeight - topviewHeight - (tabbarHeight + 5) - bottomOffset;/// bottom tabbar height
var title_view_height = 60;
var content_view_height = main_viewHeight - title_view_height;

var title_width = 150;

var item_width = deviceWidth * 0.9 * 0.9;
var item_height = 70;

export default class ResetPassword extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
        tabBarOptions: {
            activeTintColor: '#ff0000'
        }
	};

	constructor(props){
		super();

		this.state = {
            isReady: false,
            showIndicator: false,

            password: '',
            confirm_password: '',

            current_address: '',


		}
    }
    
    async componentWillMount() {
        if(Global.user_current_address == "") {
            this.setState({
                current_address : 'Your location'
            })
        } else {
            this.setState({
                current_address : Global.user_current_address
            })
        }
    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_user_address.bind(this));
    }

    init_user_address() {
        if(Global.acc_tmp_lat != 0.0 || Global.acc_tmp_lat != 0.0) {
            this.setState({
                selectedLat: Global.acc_tmp_lat,
                selectedLng: Global.acc_tmp_lat
            })
            this.getcurrent_address(Global.acc_tmp_lat, Global.acc_tmp_lat);
        }
    };

    getcurrent_address = async(currentLat, currentLng) => {
        await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + currentLat + ',' + currentLng + '&key=' + Global.MAPAPIKEY)
        .then(response => response.json())
        .then(data => {
            if(data.status == "OK") {
                this.setState({
                    current_address: data.results[0].formatted_address
                });
                Global.acc_tmp_lat = 0.0;
                Global.acc_tmp_lat = 0.0;
            } else {
                // console.warn("error.message")
            }
        })
        .catch(function(error) {
            console.log(error);
            Alert.alert('Warning!', 'Network error!');
        });
    }

    handlePassword = (typedText) => {
        this.setState({
            password: typedText
        })
    }

    handleConfirmPassword = (typedText) => {
        this.setState({
            confirm_password: typedText
        })
    }

    select_location = () => {
        this.props.navigation.navigate('AccountLocation');
    }

    save_account_info = async() => {
        if(this.state.password.length < 8 ) {
            Alert.alert("Warning!", 'Password have to be at least 8 characters.');
            return;
        };
        if(this.state.password != this.state.confirm_password ) {
            Alert.alert("Warning!", 'Password does not match.');
            return;
        };

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'user/reset_password', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'password': this.state.password,
                'password_confirm': this.state.confirm_password,
            })
        }).then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Alert.alert("Congratulation!", "Password have been changed successfully.")
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network error');
        });
        
        this.setState({showIndicator: false});
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
                <View style = {{width: '90%', height: topviewHeight, flexDirection: 'row'}}>
                    <TouchableOpacity style = {{width: '10%', height: '100%', justifyContent: 'flex-end'}} onPress = {() => this.props.navigation.navigate("Setting")}>
                        <Image style = {{width: 15, height: 15, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/back_button_black.png')}></Image>
                    </TouchableOpacity>
                    <View style = {{width: '90%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Reset Password</Text>
                    </View>
                </View> 
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center', paddingTop: 30}}>
                    <View style = {{width: '80%', height: 50, justifyContent: 'center'}}>
                        <Text style = {styles.item_text}>Reset password</Text>
                    </View>
                    <View style = {styles.input_view}>
                        <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Password' secureTextEntry = {true} onChangeText = {this.handlePassword}></TextInput>
                    </View>
                    <View style = {styles.input_view}>
                        <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Confirm password' secureTextEntry = {true} onChangeText = {this.handleConfirmPassword}></TextInput>
                    </View>
                    {/* <View style = {[styles.input_view, {flexDirection: 'row', alignItems: 'center'}]}>
                        <View style = {{width: '90%'}}>
                            <Text style = {[styles.item_text, this.state.current_address == 'Your location' ? {color: '#c0c0c0'} : null]}>{this.state.current_address}</Text>
                        </View>
                        <View style = {{width: '10%'}}>
                            <TouchableOpacity onPress = {() => this.select_location()}>
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/signup_location.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View> */}
                    <TouchableOpacity style = {styles.button_style} onPress = {() => this.save_account_info()}>
                        <Text style = {styles.item_text}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    item_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    input_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular',
        width: '100%',
        height: '100%'
    },
    input_view: {
        width: '80%',
        height: 50,
        borderColor: '#c0c0c0',
        borderBottomWidth: 1,
        justifyContent: 'center'
    },
    button_style: {
        width: '80%',
        height: 40,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 10
    },

});
