import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, } from 'react-native';
import {createStackNavigator} from "react-navigation"
import {YellowBox, 
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    ImageBackground
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { SkypeIndicator } from 'react-native-indicators';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Global from '../utils/Global/Global'

// YellowBox.ignoreWarnings(["Require cycle:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;

export default class ForgotPassword extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null
	};

	constructor(props){
		super(props);

		this.state = {
		    isVisible : true,
            isReady: false,
            showIndicator: false,

            email: '',

            success_message: '',

		}
    };
    
    async componentWillMount() {
    };

    handleEmail = (typedText) => {
        this.setState({
            email: typedText
        });
    };

    forgotPassword = async() => {
        Keyboard.dismiss();
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            Alert.alert("Warning!", 'Please use valid Email address.');
            return;
        };
 
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'user/forgot_password', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'email': this.state.email,
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status != 1) {
                Alert.alert("Warning!", 'Email does not exist');
            } else if(data.status === 1){
                this.setState({
                    success_message: 'An email with a reset password link has been sent to you email box.'
                })
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
                        <View style = {styles.title_view}>
                            <Text style = {{color: '#072B4F', fontSize: 24, fontFamily: 'Lato-Regular'}}>Reset password</Text>
                        </View>
                        <View style= {styles.comment_view}>
                            <Text style = {[styles.input_title_text, {height: '50%'}]}>Input your email</Text>
                        </View>
                        {/* <View style = {styles.input_view}>
                            <Text style = {styles.input_title_text}>Username*</Text>
                            <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Username' onChangeText = {this.handleUsername}>{this.state.username}</TextInput>
                        </View> */}
                        <View style = {styles.input_view}>
                            <Text style = {styles.input_title_text}>Email*</Text>
                            <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Email' onChangeText = {this.handleEmail}>{this.state.email}</TextInput>
                        </View>
                        <View style = {{width: '100%', height: 50}}>
                            <Text style = {{color: '#E87979', fontSize: 13, fontFamily: 'Lato-Regular', }}>{this.state.success_message}</Text>
                        </View>
                        <View style = {styles.button_view}>
                            <TouchableOpacity style = {styles.reset_button} onPress = {() => this.forgotPassword()}>
                                <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Reset password</Text>
                            </TouchableOpacity>
                            <View style = {styles.signin_view}>
                                <Text style = {{color: '#808080', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Already register?</Text>
                                <TouchableOpacity onPress = {() => this.props.navigation.navigate('SignIn')}>
                                    <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular', marginLeft: 5}}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
    background_view: {
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    main_view: {
        width: '80%',
        // height: 400,
        
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
    keep_signinview: {
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
    button_view: {
        width: '100%', 
        height: 80, 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        marginTop: 10
    },
    reset_button: {
        width: '100%', 
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
        flexDirection: 'row'
    }
});
