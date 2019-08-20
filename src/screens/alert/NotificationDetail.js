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

export default class NotificationDetail extends Component {
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

            selected_notification: Global.selected_notification,
            menu_view_show: false,

		}
    }
    
    async componentWillMount() {

    };

    update_notification_status = async(noti_status) => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/update_notification_read_status', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'notification_id': this.state.selected_notification.id,
                'read_status': noti_status
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.warn(data);
            if(data.status == 1) {
                this.setState({
                    menu_view_show: false
                })
                if(noti_status != "deleted") {
                    var selected_notification = this.state.selected_notification;
                    selected_notification.read_status = noti_status;
                    this.setState({
                        selected_notification: selected_notification
                    })
                } else {
                    this.props.navigation.navigate("Alerts");
                }
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
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
                    <TouchableOpacity style = {{width: '10%', height: '100%', justifyContent: 'flex-end'}} onPress = {() => this.props.navigation.navigate("Alerts")}>
                        <Image style = {{width: 15, height: 15, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/back_button_black.png')}></Image>
                    </TouchableOpacity>
                    <View style = {{width: '80%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>{this.state.selected_notification.title}</Text>
                    </View>
                    <View style = {{width: '10%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'row'}}>
                        <TouchableOpacity onPress = {() => {this.setState({menu_view_show: !this.state.menu_view_show})}}>
                            <Image style = {{width: 20, height: 20, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/top_right_menu.png')}></Image>
                        </TouchableOpacity>
                    </View>
                </View> 
                { 
                    this.state.menu_view_show &&
                    <View style = {{width: 100, position: 'absolute', zIndex: 10, top: topviewHeight, right: deviceWidth * 0.05 + 20, borderColor: '#000000', borderWidth: 1}}>
                        <TouchableOpacity style = {styles.menu_button} onPress = {() => this.update_notification_status("archive")}>
                            <Text style = {styles.button_text}>Archive</Text>
                        </TouchableOpacity>
                        {
                            this.state.selected_notification.read_status == "read" &&
                            <TouchableOpacity style = {styles.menu_button} onPress = {() => this.update_notification_status("unread")}>
                                <Text style = {styles.button_text}>Unread</Text>
                            </TouchableOpacity>
                        }
                        {
                            this.state.selected_notification.read_status == "unread" &&
                            <TouchableOpacity style = {styles.menu_button} onPress = {() => this.update_notification_status("read")}>
                                <Text style = {styles.button_text}>Read</Text>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity style = {styles.menu_button} onPress = {() => this.update_notification_status("deleted")}>
                            <Text style = {styles.button_text}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                }
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center'}}>
                    <View style = {{width: '90%', height: title_view_height, justifyContent: 'center'}}>
                        <Text style = {styles.item_content_text}>{this.state.selected_notification.created_at}</Text>
                    </View>
                    <View style = {{width: '90%', height: content_view_height, }}>
                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                            <Text style = {styles.item_content_text} multiline = {true}>{this.state.selected_notification.content}</Text>
                        </ScrollView>
                    </View>
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
    badge_text: {
        color: '#ffffff', 
        fontSize: 8, 
        fontFamily: 'Lato-Regular'
    },
    item_content_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    menu_button: {
        width: '100%',
        height: 30,
        justifyContent: 'center'
    },
    button_text: {
        color: '#000000', 
        fontSize: 13, 
        fontFamily: 'Lato-Regular',
        marginLeft: 5
    },
});
