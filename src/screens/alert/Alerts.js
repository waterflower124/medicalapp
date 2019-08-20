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
var toptab_viewHeight = 40;
var scollviewHeight = main_viewHeight - toptab_viewHeight;

var title_width = 150;

var item_width = deviceWidth * 0.9 * 0.9;
var item_height = 70;

export default class Alerts extends Component {
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

            search_view_show: false,

            noti_type_list: [{
                    "title": "All",
                    "selected": true
                }, {
                    "title": "Archive",
                    "selected": false
                }],
            
            globale_notification_list: [],
            notification_list: [],
            search_word: '',

		}
    }
    
    async componentWillMount() {

    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_notification_list.bind(this));
    }

    init_notification_list() {
        var noti_type_index = 0;
        for(i = 0; i < this.state.noti_type_list.length; i ++) {
            if(this.state.noti_type_list[i].selected) {
                noti_type_index = i;
                break;
            }
        }
        this.get_notification_list(noti_type_index);
    }

    select_noti_type = (index) => {
        var noti_type_list = this.state.noti_type_list;
        if(noti_type_list[index].selected) {
            return;
        }
        for(i = 0; i < noti_type_list.length; i ++) {
            if(i == index) {
                noti_type_list[i].selected = true;
            } else {
                noti_type_list[i].selected = false;
            }
        }
        this.setState({
            noti_type_list: noti_type_list
        });

        this.get_notification_list(index);
    };

    get_notification_list = async(noti_type_index) => {

        this.setState({
            notification_list: []
        });
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/user_notifications?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var temp_notification_list = [];
                var notification_list = [];
                var notification = {};
                
                for(i = 0; i < data.data.length; i ++) {
                    notification = data.data[i];
                    notification["milisend_period"] = this.get_difference_time(notification.created_at);
                    if(noti_type_index == 0) {
                        temp_notification_list.push(notification);
                    } else {
                        if(data.data[i].read_status == "archive") {
                            temp_notification_list.push(notification);
                        }
                    }
                }
                var unread_count = 0;
                for(i = 0; i < temp_notification_list.length; i ++) {
                    if(this.state.search_word == "") {
                        if(temp_notification_list[i].read_status == "unread") {
                            unread_count ++;
                        }
                        notification_list.push(temp_notification_list[i]);
                    } else {
                        if(temp_notification_list[i].content.indexOf(this.state.search_word) > -1) {
                            if(temp_notification_list[i].read_status == "unread") {
                                unread_count ++;
                            }
                            notification_list.push(temp_notification_list[i]);
                        }
                    }
                }
                notification_list["unread_count"] = unread_count;
                this.setState({
                    notification_list: notification_list,
                    globale_notification_list: notification_list
                });
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});
    };

    get_difference_time = (date_time) => {
        var milisecond_dif = 0;
        var year = 0;
        var month = 0;
        var day = 0;
        var hour = 0;
        var min = 0;
        var sec = 0;
        var formatted_date = new Date(moment(date_time).format('MM/DD/YYYY hh:mm a'));
        milisecond_dif = new Date().getTime() - formatted_date.getTime();
        year = Math.floor(milisecond_dif / (1000 * 60 * 60 * 24 * 365));
        month = Math.floor((milisecond_dif - year * (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        day = Math.floor((milisecond_dif - year * (1000 * 60 * 60 * 24 * 365) - month * (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        hour = Math.floor((milisecond_dif - year * (1000 * 60 * 60 * 24 * 365) - month * (1000 * 60 * 60 * 24 * 30) - day * (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        min = Math.floor((milisecond_dif - year * (1000 * 60 * 60 * 24 * 365) - month * (1000 * 60 * 60 * 24 * 30) - day * (1000 * 60 * 60 * 24) - hour * (1000 * 60 * 60)) / (1000 * 60));
        sec = Math.floor((milisecond_dif - year * (1000 * 60 * 60 * 24 * 365) - month * (1000 * 60 * 60 * 24 * 30) - day * (1000 * 60 * 60 * 24) - hour * (1000 * 60 * 60) - min * (1000 * 60)) / 1000);

        var formatted_period_time = "";
        if(year > 0) {
            formatted_period_time = year + "year ago";
            return formatted_period_time;
        }
        if(month > 0 ) {
            formatted_period_time = month + "month ago";
            return formatted_period_time;
        }
        if(day > 0 ) {
            formatted_period_time =  day + "day ago";
            return formatted_period_time;
        }
        if(hour > 0 ) {
            formatted_period_time = hour + "hour ago";
            return formatted_period_time;
        }
        if(min > 0 ) {
            formatted_period_time = min + "min ago";
            return formatted_period_time;
        }
        if(sec > 0 ) {
            formatted_period_time = sec + "second ago";
            return formatted_period_time;
        }
        if(formatted_period_time == "") {
            formatted_period_time = "just now";
            return formatted_period_time;
        }
    }

    handleSearchWord = (typeText) => {
        this.setState({
            search_word: typeText
        })
    }

    searchSubmit = () => {
        var globale_notification_list = this.state.globale_notification_list;
        var notification_list = [];
        for(i = 0; i < globale_notification_list.length; i ++) {
            if(this.state.search_word == "") {
                notification_list.push(globale_notification_list[i]);
            }
            else {
                if(globale_notification_list[i].content.indexOf(this.state.search_word) > -1) {
                    notification_list.push(globale_notification_list[i]);
                }
            }
        }
        var unread_count = 0;
        for(i = 0; i < notification_list.length; i ++) {
            if(notification_list[i].read_status == "unread") {
                unread_count ++;
            }
        }
        notification_list["unread_count"] = unread_count;
        this.setState({
            notification_list: notification_list,
        });
    }

    go_notification_detail = (selected_item) => {
        Global.selected_notification = selected_item;
        this.props.navigation.navigate("NotificationDetail");
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
                    <View style = {{width: title_width, height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Notifications</Text>
                    </View>
                    <View style = {{width: deviceWidth * 0.9 - title_width, height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'row'}}>
                    {
                        this.state.search_view_show &&
                        <View style = {{width: deviceWidth * 0.9 - title_width - 20 - 10, height: 20, marginBottom: 5, borderRadius: 30, backgroundColor: '#D8D8D8', flexDirection: 'row', paddingLeft: 15, paddingRight: 15, alignItems:'center', justifyContent: 'center'}}>
                            <TextInput style = {{width: '100%', height: '100%', fontFamily: 'Lato-Regular', fontSize: 13, padding: 0}} returnKeyType = {'search'} autoCapitalize='none' autoCorrect={false} underlineColorAndroid='transparent' placeholder = {"Search"} onSubmitEditing = {this.searchSubmit} onChangeText = {this.handleSearchWord}></TextInput>
                        </View>
                    }
                        <TouchableOpacity onPress = {() => {this.setState({search_view_show: !this.state.search_view_show})}}>
                            <Image style = {{width: 20, height: 20, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/ic_search_inview.png')}></Image>
                        </TouchableOpacity>
                    </View>
                </View>  
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center'}}>
                    <View style = {{width: '100%', height: toptab_viewHeight, justifyContent: 'center'}}>
                        <View>
                            <ScrollView style = {{marginLeft: 5, marginRight: 5, height: 30}} horizontal={true} showsHorizontalScrollIndicator = {false}>
                            {
                                this.state.noti_type_list.map((item, index) => 
                                <TouchableOpacity key = {index} style = {[{height: 30, paddingLeft: 5, paddingRight: 5, alignItems: 'center', flexDirection: 'row'}, item.selected ? {borderBottomWidth: 1, borderBottomColor: '#DC2F2F'} : null]} onPress = {() => this.select_noti_type(index)}>
                                    <Text style = {[{fontSize: 18, fontFamily: 'Lato-Regular'}, item.selected ? {color: '#000000'} : {color: '#A9A9B0'}]}>{item.title}</Text>
                                    {
                                        item.selected && this.state.notification_list.unread_count > 0 &&
                                        <View style = {{height: '100%'}}>
                                            <View style = {{width: 15, height: 15, marginTop: 5, borderRadius: 13, backgroundColor: "#ff0000", alignItems: 'center', justifyContent: 'center'}}>
                                                <Text style = {styles.badge_text}>{this.state.notification_list.unread_count}</Text>
                                            </View>
                                        </View>
                                    }
                                </TouchableOpacity>
                                )
                            }
                            </ScrollView>
                        </View>
                    </View>
                    <View style = {{width: '100%', height: scollviewHeight, alignItems: 'center'}}>
                        <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                        {
                            this.state.notification_list.map((item, index) => 
                            <TouchableOpacity key = {index} style = {styles.noti_item_view} onPress = {() => this.go_notification_detail(item)}>
                                <View style = {{width: '90%', height: '70%', flexDirection: 'row'}}>
                                    <View style = {{width: item_height * 0.7, height: '100%', borderRadius: item_height * 0.7, overflow: 'hidden'}}>
                                        <Image style = {{height: '100%', width: '100%'}} resizeMode = {'cover'} source = {require('../../assets/images/avatar_empty.png')}></Image>
                                    </View>
                                    <View style = {{width: item_width - item_height * 0.7 - 15, height: '100%', marginLeft: 15}}>
                                        <View style = {{width: '100%', height: '50%', flexDirection: 'row'}}>
                                            <View style = {{width: '70%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {styles.item_time_text}>System  • {item.milisend_period}</Text>
                                            </View>
                                            <View style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                            {
                                                item.read_status == "read" &&
                                                <Image style = {{width: 15, height: 15}} resizeMode = {'contain'} source = {require('../../assets/images/double-check.png')}></Image>
                                            }
                                            </View>
                                        </View>
                                        <View style = {{width: '100%', height: '50%', justifyContent: 'center'}}>
                                            <Text style = {styles.item_content_text} numberOfLines = {1} renderTruncatedFooter = {() => null}>{item.content}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            )
                        }
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
    noti_item_view: {
        width: '100%',
        height: item_height,
        alignItems: 'center',
        borderRadius: 10,
        borderColor: '#808080',
        borderWidth: 1,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    item_time_text: {
        color: '#808080', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    item_content_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    }
});
