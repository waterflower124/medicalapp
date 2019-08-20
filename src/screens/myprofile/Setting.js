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
    StatusBar,
    Linking
} from 'react-native';


import { SkypeIndicator } from 'react-native-indicators';
import moment from 'moment';
import ToggleSwitch from '../../utils/component/togglebutton/ToggleSwitch'
import AsyncStorage from '@react-native-community/async-storage';

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

export default class Setting extends Component {
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

            togglestatus: true

		}
    }
    
    async componentWillMount() {

    };

    toggleSwitch = async() => {
        this.setState({
            togglestatus: !this.state.togglestatus
        })
    }

    open_privacy() {
        var privacy_url = "http://wichz.com/Legal_Privacy"
        if(privacy_url != null && privacy_url != "") {
            Linking.canOpenURL(privacy_url).then(supported => {
                if (supported) {
                    Linking.openURL(privacy_url);
                } else {
                    this.refs.toast.show("Can't open privacy url.");
                }
            });
        } else {
            this.refs.toast.show("Can't open privacy url.");
        }
    }

    signout_alert() {
        Alert.alert("Logout", "Do you really want to log out?",
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: async() => {
                await AsyncStorage.setItem("signin", "false");
                this.props.navigation.navigate("SignIn");
            }}
        ],
        { cancelable: true })
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
                    <TouchableOpacity style = {{width: '10%', height: '100%', justifyContent: 'flex-end'}} onPress = {() => this.props.navigation.navigate("Myprofile")}>
                        <Image style = {{width: 15, height: 15, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/back_button_black.png')}></Image>
                    </TouchableOpacity>
                    <View style = {{width: '90%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Setting</Text>
                    </View>
                </View> 
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center', paddingTop: 30}}>
                    <TouchableOpacity style = {styles.item_view} onPress = {() => this.props.navigation.navigate("Myaccount")}>
                        <View style = {{width: '70%'}}>
                            <Text style = {styles.item_text}>My Account</Text>
                        </View>
                        <View style = {{width: '30%', alignItems: 'flex-end'}}>
                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/right_arrow.png')}></Image>
                        </View>
                    </TouchableOpacity>
                    <View style = {styles.bar_view}></View>
                    <TouchableOpacity style = {styles.item_view} onPress = {() => this.props.navigation.navigate("ResetPassword")}>
                        <View style = {{width: '70%'}}>
                            <Text style = {styles.item_text}>Reset Password</Text>
                        </View>
                        <View style = {{width: '30%', alignItems: 'flex-end'}}>
                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/right_arrow.png')}></Image>
                        </View>
                    </TouchableOpacity>
                    <View style = {styles.bar_view}></View>
                    <View style = {styles.item_view}>
                        <View style = {{width: '70%'}}>
                            <Text style = {styles.item_text}>Notification</Text>
                        </View>
                        <View style = {{width: '30%', alignItems: 'flex-end'}}>
                            <View style = {{width: 50, height: 30}}>
                                <ToggleSwitch
                                    isOn={this.state.togglestatus}
                                    size='small'
                                    onColor = '#ffffff'
                                    offColor = '#c0c0c0'
                                    onToggle={ (isOn) => this.toggleSwitch() }
                                />
                            </View>
                        </View>
                    </View>
                    <View style = {styles.bar_view}></View>
                    <TouchableOpacity style = {styles.item_view} onPress = {() => this.props.navigation.navigate('HelpSupport')}>
                        <View style = {{width: '70%'}}>
                            <Text style = {styles.item_text}>Help & Support</Text>
                        </View>
                        <View style = {{width: '30%', alignItems: 'flex-end'}}>
                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/right_arrow.png')}></Image>
                        </View>
                    </TouchableOpacity>
                    <View style = {styles.bar_view}></View>
                    <TouchableOpacity style = {styles.item_view} onPress = {() => this.open_privacy()}>
                        <View style = {{width: '70%'}}>
                            <Text style = {styles.item_text}>Legal and privacy</Text>
                        </View>
                        <View style = {{width: '30%', alignItems: 'flex-end'}}>
                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/right_arrow.png')}></Image>
                        </View>
                    </TouchableOpacity>
                    <View style = {styles.bar_view}></View>
                    <TouchableOpacity style = {styles.item_view} onPress = {() => this.signout_alert()}>
                        <View style = {{width: '70%'}}>
                            <Text style = {styles.item_text}>Logout</Text>
                        </View>
                        <View style = {{width: '30%', alignItems: 'flex-end'}}>
                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/right_arrow.png')}></Image>
                        </View>
                    </TouchableOpacity>
                    <View style = {styles.bar_view}></View>
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
    item_view: {
        width: '90%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center'
    },
    item_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    bar_view: {
        width: '90%',
        height: 1,
        backgroundColor: '#808080'
    },
    button_text: {
        color: '#000000', 
        fontSize: 13, 
        fontFamily: 'Lato-Regular',
        marginLeft: 5
    },
});
