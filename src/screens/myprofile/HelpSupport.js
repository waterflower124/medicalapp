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

export default class HelpSupport extends Component {
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

            subject_text: '',
            contents_text: '',

		}
    }
    
    async componentWillMount() {
        
    };

    handlesubject= (typedText) => {
        this.setState({
            subject_text: typedText
        })
    }

    handlecontants = (typedText) => {
        this.setState({
            contents_text: typedText
        })
    }

    select_location = () => {
        this.props.navigation.navigate('AccountLocation');
    }

    submit_query = async() => {

        if(this.state.subject_text.trim() == "") {
            Alert.alert("Please input subject.");
            return;
        }

        if(this.state.contents_text.trim() == "") {
            Alert.alert("Please input contant.");
            return;
        }
       
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'user/contact_us', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'subject': this.state.subject_text,
                'content': this.state.contents_text,
            })
        }).then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Alert.alert("Congratulation!", "Your message has been successfully submitted.")
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
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Help & Support</Text>
                    </View>
                </View> 
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center', paddingTop: 30}}>
                    <View style = {{width: '80%', height: 50, justifyContent: 'center'}}>
                        <Text style = {styles.item_text}>Help & Support</Text>
                    </View>
                    <View style = {styles.input_view}>
                        <Text style = {styles.item_text}>Subject</Text>
                        <TextInput style = {styles.input_text} placeholder = 'Subject' onChangeText = {this.handlesubject}>{this.state.subject_text}</TextInput>
                    </View>
                    <View style = {[styles.input_view, {height: 150}]}>
                        <Text style = {[styles.item_text, {height: 20}]}>Contants</Text>
                        <TextInput style = {[styles.input_text, {height: 120, textAlignVertical: "top"}]} multiline = {true} placeholder = 'Contants' onChangeText = {this.handlecontants}>{this.state.contents_text}</TextInput>
                    </View>
                    <TouchableOpacity style = {styles.button_style} onPress = {() => this.submit_query()}>
                        <Text style = {styles.item_text}>Submit</Text>
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
        justifyContent: 'center',
    },
    item_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    input_view: {
        width: '80%',
        height: 60,
        borderColor: '#c0c0c0',
        borderBottomWidth: 1,
        justifyContent: 'space-around',
        marginTop: 30
    },
    input_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular',
        width: '100%',
        height: '100%'
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
