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
var profile_view_height = 100;
var title_view_height = 25;
var scroll_view_height = main_viewHeight - profile_view_height - title_view_height;

var title_width = 150;

export default class Myprofile extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
        tabBarOptions: {
            activeTintColor: '#ff0000'
        },
        title: 'My Profile'
	};

	constructor(props){
		super();

		this.state = {
            isReady: false,
            showIndicator: false,

            avatar_url: Global.avatar_url,
            user_name: '',
            user_email: Global.email,
            created_year: '',

            my_card_list: [],

            show_add_modal: false,

            show_bank_list: false,
            show_card_list: false,

            bank_list: [],
            all_card_list: [],
            selected_card_list: [],
            selected_bank: {},
            selected_card: {},

            inputed_annual_fee: "",
            inputed_arp: "",

		}
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_user_name.bind(this));
    }

    init_user_name() {
        if(Global.first_name == "" && Global.last_name == "") {
            this.setState({
                user_name: Global.username
            })
        } else {
            this.setState({
                user_name: Global.first_name + " " +  Global.last_name
            })
        };
    }
    
    async componentWillMount() {

        this.props.navigation.addListener('willFocus', this.init_cards.bind(this));

    };

    init_cards = async() => {
        var created_date = new Date(parseInt(Global.created_at, 10));
        // console.warn(created_date);
        this.setState({
            created_year: created_date.getFullYear()
        });

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/user_cards?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                this.setState({
                    my_card_list: data.data
                })
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });

        await fetch(Global.base_url + 'card/all_cards?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var all_card_list = data.data;
                var bank_list = [];
                var bank_exist = false;
                for(i = 0; i < all_card_list.length; i ++) {
                    bank_exist = false;
                    for(j = 0; j < bank_list.length; j ++) {
                        if(all_card_list[i].bank.id == bank_list[j].id) {
                            bank_exist = true;
                            break;
                        }
                    }
                    if(!bank_exist) {
                        bank_list.push(all_card_list[i].bank)
                    }
                }
                var selected_card_list = [];
                for(i = 0; i < all_card_list.length; i ++) {
                    if(all_card_list[i].bank.id == bank_list[0].id) {
                        selected_card_list.push(all_card_list[i]);
                    }
                }
                this.setState({
                    all_card_list: all_card_list,
                    bank_list: bank_list,
                    selected_card_list: selected_card_list,
                    selected_bank: bank_list[0],
                    selected_card: selected_card_list[0]
                });
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});
    }

    select_bank = (item) => {
        this.setState({
            selected_bank: item,
            show_bank_list: false,
        });
        var selected_card_list = [];
        var all_card_list = this.state.all_card_list;
        for(i = 0; i < all_card_list.length; i ++) {
            if(all_card_list[i].bank.id == item.id) {
                selected_card_list.push(all_card_list[i]);
            }
        }
        this.setState({
            selected_card_list: selected_card_list,
            selected_card: selected_card_list[0]
        });
        if(selected_card_list.length == 0) {
            this.setState({
                selected_card: null
            });
        } else {
            this.setState({
                selected_card: selected_card_list[0]
            });
        }
    }

    select_card = (item) => {
        this.setState({
            selected_card: item,
            show_card_list: false,
        })
    }

    add_card = async() => {
        var inputed_arp = "0";
        var inputed_annual_fee = "0";
        if(this.state.inputed_annual_fee != "") {
            inputed_annual_fee = this.state.inputed_annual_fee;
        }
        if(this.state.inputed_arp != "") {
            inputed_arp = this.state.inputed_arp;
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/add_card', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                // 'title': this.state.selected_card.title,
                // 'bank_id': this.state.selected_bank.id,
                // 'type_id': this.state.selected_card.id,
                'annual_fee': inputed_annual_fee,
                'arp': inputed_arp,
                'card_id': this.state.selected_card.id,
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var my_card_list = this.state.my_card_list;
                my_card_list.push(data.data);
                this.setState({
                    my_card_list: my_card_list,
                    show_add_modal: false
                })
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        
        this.setState({showIndicator: false});
    }

    cancel_add = () => {
        this.setState({
            show_add_modal: false
        })
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
            {
                this.state.show_add_modal &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5}}>
                    <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3}}>
                    </View>
                    <View style = {{width: '90%', height: 400, backgroundColor: '#ffffff', alignItems: "center", borderRadius: 10}}>
                        <View style = {{width: '90%', height: '80%'}}>
                            <View style = {{width: '100%', height: 50, flexDirection: 'row'}}>
                                <View style = {{width: '70%', height: '100%', justifyContent: 'center'}}>
                                    <Text style = {[styles.profile_text, {color: '#ff0000', fontSize: 18}]}>Add new cards</Text>
                                </View>
                                <TouchableOpacity style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}} onPress = {() => this.cancel_add()}>
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/cancel_button.png')}></Image>
                                </TouchableOpacity>
                            </View>
                            <Text style = {styles.profile_text}>Choose bank</Text>
                            <View style = {[{width: '100%', marginTop: 10}, Platform.OS == "ios" ? {zIndex: 20} : null]}>
                                <TouchableOpacity style = {styles.list_button_style} onPress = {() => {this.setState({show_bank_list: !this.state.show_bank_list})}}>
                                    <View style = {{width: '70%', height: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                        <View style = {{height: '70%', marginLeft: 10}}>
                                            <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}></Image>
                                        </View>
                                        <Text style = {[styles.profile_text, {marginLeft: 10}]}>{this.state.selected_bank.title}</Text>
                                    </View>
                                    <View style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', marginRight: 10}}>
                                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/down_arrow.png')}></Image>
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.show_bank_list &&
                                    <View style = {[styles.list_view, Platform.OS == "android" ? {zIndex: 20} : null]}>
                                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                                        {
                                            this.state.bank_list.map((item, index) => 
                                            <TouchableOpacity key = {index} style = {styles.list_item} onPress = {() => {this.select_bank(item)}}>
                                                <View style = {{width: '70%', height: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                                    <View style = {{height: '70%', marginLeft: 10}}>
                                                        <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}></Image>
                                                    </View>
                                                    <Text style = {[styles.profile_text, {marginLeft: 10}]}>{item.title}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            )
                                        }
                                        </ScrollView>
                                    </View>
                                }
                            </View>
                            <Text style = {[styles.profile_text, {marginTop: 20}]}>Choose credit card</Text>
                            <View style = {[{width: '100%', marginTop: 10}, Platform.OS == "ios" ? {zIndex: 10} : null]}>
                                <TouchableOpacity style = {styles.list_button_style} onPress = {() => {this.setState({show_card_list: !this.state.show_card_list})}}>
                                    <View style = {{width: '70%', height: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                        <View style = {{height: '70%', marginLeft: 10}}>
                                        {
                                            this.state.selected_card.image1 == "" &&
                                            <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}></Image>
                                        }
                                        {
                                            this.state.selected_card.image1 != "" &&
                                            <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {{uri: this.state.selected_card.image1}}></Image>
                                        }
                                        </View>
                                        <Text style = {[styles.profile_text, {marginLeft: 10}]}>{this.state.selected_card.title}</Text>
                                    </View>
                                    <View style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', marginRight: 10}}>
                                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source = {require('../../assets/images/down_arrow.png')}></Image>
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.show_card_list &&
                                    <View style = {[styles.list_view, Platform.OS == "android" ? {zIndex: 10} : null]}>
                                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                                        {
                                            this.state.selected_card_list.map((item, index) => 
                                            <TouchableOpacity key = {index} style = {styles.list_item} onPress = {() => {this.select_card(item)}}>
                                                <View style = {{width: '70%', height: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                                    <View style = {{height: '70%', marginLeft: 10}}>
                                                    {
                                                        item.image1 == "" &&
                                                        <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}></Image>
                                                    }
                                                    {
                                                        item.image1 != "" &&
                                                        <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {{uri: item.image1}}></Image>
                                                    }
                                                    </View>
                                                    <Text style = {[styles.profile_text, {marginLeft: 10}]}>{item.title}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            )
                                        }
                                        </ScrollView>
                                    </View>
                                }
                            </View>
                            <View style = {{width: '100%', marginTop: 20}}>
                                <View style = {{width: '100%', flexDirection: 'row'}}>
                                    <View style = {{width: 100}}>
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>Annual Fee: </Text>
                                    </View>
                                    <TextInput style = {[styles.profile_text, {width: 50, height: '100%', color: '#808080', borderBottomColor: '#c0c0c0', borderBottomWidth: 1}]} 
                                        keyboardType = {'numeric'} 
                                        onChangeText = {(text) => this.setState({inputed_annual_fee: text})}
                                        placeholder = '0'>
                                            {/* {this.state.inputed_annual_fee} */}
                                    </TextInput>
                                    <Text style = {[styles.profile_text, {color: '#808080'}]}> $</Text>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row', marginTop: 10}}>
                                    <View style = {{width: 100}}>
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>ARP: </Text>
                                    </View>
                                    <TextInput style = {[styles.profile_text, {width: 50, height: '100%', color: '#808080', borderBottomColor: '#c0c0c0', borderBottomWidth: 1}]} 
                                        keyboardType = {'numeric'}
                                        onChangeText = {(text) => this.setState({inputed_arp: text})}
                                        placeholder = '0'>
                                            {/* {this.state.inputed_arp} */}
                                    </TextInput>
                                    <Text style = {[styles.profile_text, {color: '#808080'}]}> %</Text>
                                    {/* {
                                        this.state.selected_card.arp == "" &&
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>0%</Text>
                                    }
                                    {
                                        this.state.selected_card.arp != "" &&
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>{parseFloat(this.state.selected_card.arp)}%</Text>
                                    } */}
                                </View>
                            </View>
                        </View>
                        <View style = {{width: '100%', height: '20%', justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                            <TouchableOpacity style = {[styles.button_style, {backgroundColor: '#ff0000'}]} onPress = {() => this.add_card()}>
                                <Text style = {styles.button_text}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {[styles.button_style, {backgroundColor: '#ffffff'}]} onPress = {() => this.cancel_add()}>
                                <Text style = {[styles.button_text, {color: '#000000'}]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
                <View style = {{width: '90%', height: topviewHeight, flexDirection: 'row'}}>
                    <View style = {{width: title_width, height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>My profile</Text>
                    </View>
                    <View style = {{width: deviceWidth * 0.9 - title_width, height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'row'}}>
                        <TouchableOpacity onPress = {() => this.props.navigation.navigate("Setting")}>
                            <Image style = {{width: 20, height: 20, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/top_right_menu.png')}></Image>
                        </TouchableOpacity>
                    </View>
                </View> 
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center'}}>
                    <View style = {{width: '90%', height: profile_view_height, alignItems: 'center', flexDirection: 'row'}}>
                    {
                        this.state.avatar_url == "" &&
                        <View style = {{width: profile_view_height * 0.6, height: '60%', borderRadius: profile_view_height * 0.6, overflow: 'hidden'}}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'cover'} source = {require('../../assets/images/avatar_empty.png')}></Image>
                        </View>
                    }
                    {
                        this.state.avatar_url != "" &&
                        <View style = {{width: profile_view_height * 0.6, height: '60%', borderRadius: profile_view_height * 0.6, overflow: 'hidden'}}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'cover'} source = {{uri: this.state.avatar_url}}></Image>
                        </View>
                    }
                        <View style = {{width: deviceWidth * 0.9 - profile_view_height * 0.6 - 10, height: '60%', marginLeft: 10, justifyContent: 'space-between'}}>
                            <Text style = {styles.profile_text}>Name: {this.state.user_name}</Text>
                            <Text style = {styles.profile_text}>E-mail: {this.state.user_email}</Text>
                            <Text style = {styles.profile_text}>Joined since {this.state.created_year}</Text>
                        </View>
                    </View>
                    <View style = {{width: '90%', height: title_view_height, justifyContent: 'center', borderBottomColor: '#c0c0c0', borderBottomWidth: 1}}>
                        <Text style = {styles.profile_text}>My cards</Text>
                    </View>
                    <View style = {{width: '90%', height: scroll_view_height}}>
                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                        {
                            this.state.my_card_list.map((item, index) => 
                            <View key = {index} style = {{width: '100%', height: 60, borderColor: '#c0c0c0', borderWidth: 1, marginTop: 5, justifyContent: 'center', alignItems: 'center'}}>
                                <View style = {{width: '90%', height: '80%', flexDirection: 'row'}}>
                                    <View style = {{height: '100%'}}>
                                    {
                                        item.image1 == "" &&
                                        <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}></Image>
                                    }
                                    {
                                        item.image1 != "" &&
                                        <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {{uri: item.image1}}></Image>
                                    }
                                    </View>
                                    <View style = {{height: '100%', marginLeft: 10, justifyContent: 'space-between'}}>
                                        <Text style = {styles.my_card_item_title_text}>{item.title}</Text>
                                        <View style = {{width: 250, flexDirection: 'row'}}>
                                            <View style = {{width: '50%'}}>
                                                <Text style = {styles.my_card_item_content_text}>Annual fee: ${item.annual_fee}</Text>
                                            </View>
                                            <View style = {{width: '50%'}}>
                                                <Text style = {styles.my_card_item_content_text}>ARP: {item.arp}%</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            )
                        }
                            <View style = {{width: '100%', height: 80, justifyContent: 'center', alignItems: 'center'}}>
                                <TouchableOpacity onPress = {() => {this.setState({show_add_modal: true})}}>
                                    <Image style = {{width: 50, height: 50}} source = {require('../../assets/images/add_card.png')}></Image>
                                </TouchableOpacity>
                            </View>
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
    profile_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    list_button_style: {
        width: '100%', 
        height: 40,
        justifyContent: 'center', 
        flexDirection: 'row',
        borderColor: '#808080',
        borderWidth: 1,
    },
    list_view: {
        width: '100%', 
        height: 100,
        position: 'absolute',
        left: 0,
        top: 40,
        backgroundColor: '#ffffff',
        borderColor: '#808080',
        borderWidth: 1
    },
    list_item: {
        width: '100%', 
        height: 40,
        alignItems: 'center', 
        flexDirection: 'row',
    },
    button_style: {
        width: '40%', 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 40,
        
    },
    button_text: {
        color: '#ffffff', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    my_card_item_title_text: {
        color: '#ff0000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    my_card_item_content_text: {
        color: '#808080', 
        fontSize: 13, 
        fontFamily: 'Lato-Regular'
    }
});
