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

import Global from '../../utils/Global/Global'
import {getInset} from 'react-native-safe-area-view'

const bottomOffset = getInset('bottom');

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topviewHeight = Platform.OS == 'android' ? 80 - StatusBar.currentHeight : 80;
var tabbarHeight = 50
var main_viewHeight = Platform.OS == 'android' ? deviceHeight - topviewHeight - (tabbarHeight + 5) - StatusBar.currentHeight : deviceHeight - topviewHeight - (tabbarHeight + 5) - bottomOffset;/// bottom tabbar height
var search_viewHeight = 40;
var toptab_viewHeight = 40;
var scollviewHeight = main_viewHeight - search_viewHeight - toptab_viewHeight;

export default class Card extends Component {
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

            cards_list: [],

            bank_list: Global.bank_list,
            selected_bank_inex: 0,

            search_word: '',

            cards_likes_list: [],

            show_add_modal: false,
            show_bank_list: false,
            show_card_list: false,
            // bank_list: [],
            all_card_list: [],
            selected_card_list: [],
            selected_bank: {},
            selected_card: {},

            inputed_annual_fee: "",
            inputed_arp: "",

		}
    }
    
    async componentWillMount() {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/bank_list?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Global.bank_list = data.data;
                
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});

        var bank_list = Global.bank_list;
        var alltab = {"id": "-1", "title": 'All', "selected": true};
        bank_list.unshift(alltab);
        for(i = 0; i < bank_list.length; i ++) {
            if( i == 0) {
                bank_list[i]["selected"] = true;
            } else {
                bank_list[i]["selected"] = false;
            }
        }
        Global.bank_list = bank_list;
        this.setState({
            bank_list: bank_list,
        });

        ////  this is for card add
        await fetch(Global.base_url + 'card/all_cards?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var all_card_list = data.data;
                var bank_list = Global.bank_list;
                // var bank_exist = false;
                // for(i = 0; i < all_card_list.length; i ++) {
                //     bank_exist = false;
                //     for(j = 0; j < bank_list.length; j ++) {
                //         if(all_card_list[i].bank.id == bank_list[j].id) {
                //             bank_exist = true;
                //             break;
                //         }
                //     }
                //     if(!bank_exist) {
                //         bank_list.push(all_card_list[i].bank)
                //     }
                // }
                var selected_card_list = [];
                for(i = 0; i < all_card_list.length; i ++) {
                    if(all_card_list[i].bank.id == bank_list[1].id) {
                        selected_card_list.push(all_card_list[i]);
                    }
                }
                this.setState({
                    all_card_list: all_card_list,
                    selected_card_list: selected_card_list,
                    selected_bank: bank_list[1],
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
        ////////////////////// 

        // await this.getCards();
        this.setState({
            isReady: true
        })
    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_cards.bind(this));
    }

    init_cards = async() => {

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/card_likes?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Global.cards_likes_list = data.data;
                this.setState({
                    cards_likes_list: data.data
                })
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});

        await this.getCards();

    }

    getCards = async() => {
        this.setState({showIndicator: true});
        var bank_id;
        if(this.state.selected_bank_inex == 0) {
            bank_id = "all"
        } else {
            bank_id = this.state.bank_list[this.state.selected_bank_inex].id
        }
        await fetch(Global.base_url + 'card/search_cards?token=' + Global.user_token + "&search_text=&bank_id=" + bank_id + "&sort_by=relevant&limit=20&offset=0")
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var cards_list = data.data.data;
                var bank_list = Global.bank_list;
                for(i = 0; i < cards_list.length; i ++) {
                    for(j = 0; j < bank_list.length; j ++) {
                        if(cards_list[i].bank_id == bank_list[j].id) {
                            cards_list[i]["bank_title"] = bank_list[j].title;
                            break;
                        }
                    }
                }
                var cards_likes_list = this.state.cards_likes_list;
                for(i = 0; i < cards_list.length; i ++) {
                    cards_list[i]["like"] = 0;
                    for(j = 0; j < cards_likes_list.length; j ++) {
                        if(cards_list[i].id == cards_likes_list[j].card_id) {
                            if(cards_likes_list[j].like_status == "1") {
                                cards_list[i].like = 1;
                            } else {
                                cards_list[i].like = 0;
                            }
                            break;
                        }
                    }
                }
                this.setState({
                    cards_list: cards_list
                });
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        
        this.setState({showIndicator: false});
    }

    select_tab = async(index) => {
        var bank_list = this.state.bank_list;
        for(i = 0; i < bank_list.length; i ++) {
            if( i == index) {
                bank_list[i].selected = true;
            } else {
                bank_list[i].selected = false;
            }
        }
        this.setState({
            bank_list: bank_list,
            selected_bank_inex: index
        }, async() => {
            this.getCards();
        });
    }

    handleSearchWord = (typeText) => {
        this.setState({
            search_word: typeText
        })
    }

    searchSubmit = () => {
        Global.search_word = this.state.search_word;
        this.props.navigation.navigate("SearchCard");
    }

    display_card_detail = (item) => {
        Global.selected_card = item;
        Global.previou_of_detail = "Card";
        this.props.navigation.navigate("CardDetail", {selected_discount: item});
    }

    card_like = async(item) => {
        var like = 0;
        if(item.like == 1) {
            like = 0;
        } else {
            like = 1;
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/card_like', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'card_id': item.id,
                'like': like
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var cards_list = this.state.cards_list;
                for(i = 0; i < cards_list.length; i ++) {
                    if(cards_list[i].id == item.id) {
                        cards_list[i].like = like;
                        break;
                    }
                }
                this.setState({
                    cards_list: cards_list
                })
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network error');
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
                this.setState({show_add_modal: false})
                // Alert.alert("Warning!", "There's error in server");
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
        if (!this.state.isReady) {
            return (
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                    <View style = {{flex: 1}}>
                        <SkypeIndicator color = '#ffffff' />
                    </View>
                </View>
            )
        }
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
                                            index != 0 &&
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
                                            this.state.selected_card != null && this.state.selected_card.image1 == "" &&
                                            <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}></Image>
                                        }
                                        {
                                            this.state.selected_card != null && this.state.selected_card.image1 != "" &&
                                            <Image style = {{height: '100%', aspectRatio: 1.6}} resizeMode = {'stretch'} source = {{uri: this.state.selected_card.image1}}></Image>
                                        }
                                        </View>
                                        {
                                            this.state.selected_card != null && 
                                            <Text style = {[styles.profile_text, {marginLeft: 10}]}>{this.state.selected_card.title}</Text>
                                        }
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
                    <View style = {{width: '80%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Card</Text>
                    </View>
                    <View style = {{width: '20%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress = {() => {this.setState({show_add_modal: true})}}>
                            <Image style = {{width: 20, height: 20, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/ic_plus.png')}></Image>
                        </TouchableOpacity>
                    </View>
                </View>  
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center'}}>
                    <View style = {{width: '90%', height: search_viewHeight, flexDirection: 'row', paddingTop: 5, paddingBottom: 5}}>
                        <View style = {{width: deviceWidth * 0.9 * 0.9, height: 30, borderRadius: 30, backgroundColor: '#D8D8D8', flexDirection: 'row', paddingLeft: 15, paddingRight: 15, alignItems:'center', justifyContent: 'center'}}>
                            <Image style = {{height: 20, width: 20}} resizeMode = {'contain'} source = {require('../../assets/images/ic_search_inview.png')}></Image>
                            <TextInput style = {{width: deviceWidth * 0.9 * 0.9 - 20 - 30, height: 25, fontFamily: 'Lato-Regular', fontSize: 15, padding: 0}} returnKeyType = {'search'} autoCapitalize='none' autoCorrect={false} underlineColorAndroid='transparent' placeholder = {"Search card, discount and offer"} onSubmitEditing = {this.searchSubmit} onChangeText = {this.handleSearchWord}></TextInput>
                        </View>
                        <View style = {{width: deviceWidth * 0.9 * 0.1, height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                            <TouchableOpacity style = {{height: 25, width: 25}} onPress = {() => this.props.navigation.navigate("SearchCard")}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../../assets/images/ic_filter.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style = {{width: '100%', height: toptab_viewHeight, justifyContent: 'center'}}>
                        <ScrollView style = {{marginLeft: 5, marginRight: 5, height: 30}} horizontal={true} showsHorizontalScrollIndicator = {false}>
                        {
                            this.state.bank_list.map((item, index) => 
                            <TouchableOpacity key = {index} style = {[{height: 30, paddingLeft: 5, paddingRight: 5, alignItems: 'center', justifyContent: 'center'}, item.selected ? {borderBottomWidth: 1, borderBottomColor: '#DC2F2F'} : null]} onPress = {() => this.select_tab(index)}>
                                <Text style = {[{fontSize: 15, fontFamily: 'Lato-Regular'}, item.selected ? {color: '#000000'} : {color: '#A9A9B0'}]}>{item.title}</Text>
                            </TouchableOpacity>
                            )
                        }
                        </ScrollView>
                    </View>
                    <View style = {{width: '100%', height: scollviewHeight}}>
                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                        {
                            this.state.cards_list.map((item, index) => 
                            <TouchableOpacity key = {index} style = {{width: '100%', height: 120, flexDirection: 'row',justifyContent: 'center', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#808080'}} onPress = {() => this.display_card_detail(item)}>
                                <View style = {{width: 100, height: 100, justifyContent: 'center'}}>
                                {
                                    item.image1 !== "" &&
                                    <Image style = {{width: '100%', height: '60%'}} resizeMode = {'stretch'} source = {{uri: item.image1}}/>
                                }
                                {
                                    item.image1 === "" &&
                                    <Image style = {{width: '100%', height: '60%'}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}/>
                                }   
                                </View>
                                <View style = {{width: deviceWidth * 0.9 - 20 - 100, paddingLeft: 10, paddingRight: 10}}>
                                    <View style = {{width: '100%', height: '25%', flexDirection: 'row'}}>
                                        <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                                            <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular'}}>{item.title}</Text>
                                        </View>
                                        <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                            <TouchableOpacity onPress = {() => this.card_like(item)}>
                                            {
                                                item.like == 1 &&
                                                <Image style = {{width: 20, height: 20}} resizeMode = {'stretch'} source = {require('../../assets/images/ic_heart_fav.png')}></Image>
                                            }
                                            {
                                                item.like == 0 &&
                                                <Image style = {{width: 20, height: 20}} resizeMode = {'stretch'} source = {require('../../assets/images/ic_heart_unfav.png')}></Image>
                                            }
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style = {{width: '100%', height: '18%', justifyContent: 'center'}}>
                                    {
                                        item.discounts.length != 0 && item.discounts[0].title != null &&
                                        <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>{item.discounts[0].title}</Text>
                                    }
                                    </View>
                                    <View style = {{width: '100%', height: '18%', justifyContent: 'center'}}>
                                    {
                                        item.annual_fee == 0 &&
                                        <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>No annual fee</Text>
                                    }
                                    {
                                        item.annual_fee != 0 &&
                                        <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>Annual fee ${item.annual_fee}</Text>
                                    }
                                    </View>
                                    <View style = {{width: '100%', height: '18%', alignItems: 'center', flexDirection: 'row'}}>
                                        {/* <Image style = {{width: 18, height: 18}} resizeMode = {'contain'} source = {require('../../assets/images/ic_bell.png')}></Image>
                                        <Text style = {{color: '#bcc0c8', fontSize: 13, fontFamily: 'Lato-Regular'}}>item.expire_date</Text> */}
                                    </View>
                                    <View style = {{width: '100%', height: '18%', alignItems: 'center', flexDirection: 'row'}}>
                                        <Image style = {{width: 18, height: 18}} resizeMode = {'contain'} source = {require('../../assets/images/ic_tag.png')}></Image>
                                        <Text style = {{color: '#bcc0c8', fontSize: 13, fontFamily: 'Lato-Regular'}}>{item.bank_title}</Text>
                                        <Image style = {{width: 18, height: 18, marginLeft: 20}} resizeMode = {'contain'} source = {require('../../assets/images/ic_ratingstar.png')}></Image>
                                        {
                                            item.rating !== null &&
                                            <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>{parseFloat(item.rating)}</Text>
                                        }
                                        {
                                            item.rating === null &&
                                            <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>0</Text>
                                        }
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
        backgroundColor: '#ffffff',
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
});
