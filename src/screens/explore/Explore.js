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
    ImageBackground,
    StatusBar,
    WebView
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import Swiper from 'react-native-swiper'
import ToggleSwitch from '../../utils/component/togglebutton/ToggleSwitch'
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
var viewpager_Height = 150;
var toggle_viewHeight = 40;
var scollviewHeight = main_viewHeight - search_viewHeight - toptab_viewHeight;

export default class Explore extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
        // tabBarIcon: (focused, tintColor) => (
        //     <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('../../assets/images/ic_search.png')} />
        // ), 
        tabBarOptions: {
            activeTintColor: '#ff0000',
            style: {
                width: deviceWidth,
                height: tabbarHeight
            }
        }
	};

	constructor(props){
		super(props);

		this.state = {
            isReady: false,
            showIndicator: false,

            tab_list: Global.category_list,
            tab_list_select: [],
            selected_tab_index: 0,

            trending_list: [],


            togglestatus: true,

            search_word: '',
            discounts_list: [],

            discount_likes_list: [],



            show_add_modal: false,
            show_bank_list: false,
            show_card_list: false,
            bank_list: [],
            all_card_list: [],
            selected_card_list: [],
            selected_bank: {},
            selected_card: {},


		}
    }
    
    async componentWillMount() {

        ////  this is for card add
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
        ////////////////////// 

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'discount/category_list?token=' + Global.user_token,)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Global.category_list = data.data;
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});

        var tab_list = Global.category_list;
        var alltab = {"id": -1, "title": 'All', "pos": -1};
        tab_list.unshift(alltab);
        var tab_list_select = []
        for(i = 0; i < tab_list.length; i ++) {
            if( i == 0) {
                tab_list_select.push(true);
            } else {
                tab_list_select.push(false);
            }
        }
        this.setState({
            tab_list: tab_list,
            tab_list_select: tab_list_select
        });

        await this.getTrending_list();
        // this.getDiscounts();
        this.setState({
            isReady: true
        })
    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_discounts.bind(this));
    }

    init_discounts = async() => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'discount/discount_likes?token=' + Global.user_token,)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Global.discounts_likes_list = data.data;
                this.setState({
                    discount_likes_list: data.data
                })
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});

        this.getDiscounts();
    }

    getTrending_list = async() => {
        this.setState({showIndicator: true});
        var category_id;
        if(this.state.selected_tab_index == 0) {
            category_id = "all"
        } else {
            category_id = this.state.tab_list[this.state.selected_tab_index].id
        }
        await fetch(Global.base_url + 'discount/trending_list?token=' + Global.user_token + "&category_id=" + category_id)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                if(data.data.length > 0) {
                    this.setState({
                        trending_list: data.data
                    }) 
                } else {
                    var empty_trending = {
                        "id": "-1",
                        "image1": "",
                        "title": ""
                    }
                    var trending_list = [];
                    trending_list.push(empty_trending);
                    this.setState({
                        trending_list: trending_list
                    }) 
                }
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});
    }

    getDiscounts = async() => {
        this.setState({showIndicator: true});
        var category_id;
        if(this.state.selected_tab_index == 0) {
            category_id = "all"
        } else {
            category_id = this.state.tab_list[this.state.selected_tab_index].id
        }
        var with_user_card = 0;
        if(this.state.togglestatus) {
            with_user_card = 1;
        } else {
            with_user_card = 0;
        }
        await fetch(Global.base_url + 'discount/search_discounts?token=' + Global.user_token + "&search_text=&with_user_card=" + with_user_card + "&category_id=" + category_id + "&filter=&sort_by=best&limit=20&offset=0")
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var discounts_list = data.data.data;
                var discount_likes_list = this.state.discount_likes_list;
                for(i = 0; i < discounts_list.length; i ++) {
                    discounts_list[i]["like"] = 0;
                    for(j = 0; j < discount_likes_list.length; j ++) {
                        if(discounts_list[i].id == discount_likes_list[j].discount_id) {
                            if(discount_likes_list[j].like_status == "1") {
                                discounts_list[i].like = 1;
                            }
                            break;
                        }
                    }
                }
                this.setState({
                    discounts_list: discounts_list
                }) 
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});
    }

    select_tab = async(index) => {
        var tab_list_select = this.state.tab_list_select;
        for(i = 0; i < tab_list_select.length; i ++) {
            if( i == index) {
                tab_list_select[i] = true;
            } else {
                tab_list_select[i] = false;
            }
        }
        this.setState({
            tab_list_select: tab_list_select,
            selected_tab_index: index
        }, async() => {
            await this.getTrending_list();
            this.getDiscounts();
        });
        
    }

    toggleSwitch = () => {
        this.setState({
            togglestatus: !this.state.togglestatus
        }, () => {
            this.getDiscounts();
        })
    }
    
    handleSearchWord = (typeText) => {
        this.setState({
            search_word: typeText
        })
    }

    searchSubmit = () => {
        Global.search_word = this.state.search_word;
        this.props.navigation.navigate("SearchDiscount");
    }

    display_discount_detail = (item) => {
        Global.selected_discount = item;
        Global.previou_of_detail = "Explore";
        this.props.navigation.navigate("DiscountDetail", {selected_discount: item});
    }

    discount_like = async(item) => {
        var like = 0;
        if(item.like == 1) {
            like = 0;
        } else {
            like = 1;
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'discount/discount_like', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'discount_id': item.id,
                'like': like
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var discounts_list = this.state.discounts_list;
                for(i = 0; i < discounts_list.length; i ++) {
                    if(discounts_list[i].id == item.id) {
                        discounts_list[i].like = like;
                        break;
                    }
                }
                this.setState({
                    discounts_list: discounts_list
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
                // 'annual_fee': this.state.selected_card.annual_fee,
                // 'arp': this.state.selected_card.arp
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
                                    <Text style = {[styles.profile_text, {color: '#808080'}]}>${parseFloat(this.state.selected_card.annual_fee)}</Text>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row'}}>
                                    <View style = {{width: 100}}>
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>ARP: </Text>
                                    </View>
                                    {
                                        this.state.selected_card.arp == "" &&
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>0%</Text>
                                    }
                                    {
                                        this.state.selected_card.arp != "" &&
                                        <Text style = {[styles.profile_text, {color: '#808080'}]}>{parseFloat(this.state.selected_card.arp)}%</Text>
                                    }
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
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Explore</Text>
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
                            <TouchableOpacity style = {{height: 25, width: 25}} onPress = {() => this.props.navigation.navigate("SearchDiscount")}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../../assets/images/ic_filter.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style = {{width: '100%', height: toggle_viewHeight, justifyContent: 'center'}}>
                        <ScrollView style = {{marginLeft: 5, marginRight: 5, height: 30}} horizontal={true} showsHorizontalScrollIndicator = {false}>
                        {
                            this.state.tab_list.map((item, index) => 
                            <TouchableOpacity key = {index} style = {[{height: 30, paddingLeft: 5, paddingRight: 5, alignItems: 'center', justifyContent: 'center'}, this.state.tab_list_select[index] ? {borderBottomWidth: 1, borderBottomColor: '#DC2F2F'} : null]} onPress = {() => this.select_tab(index)}>
                                <Text style = {[{fontSize: 15, fontFamily: 'Lato-Regular'}, this.state.tab_list_select[index] ? {color: '#000000'} : {color: '#A9A9B0'}]}>{item.title}</Text>
                            </TouchableOpacity>
                            )
                        }
                        </ScrollView>
                    </View>
                    <View style = {{width: '100%', height: scollviewHeight}}>
                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                            <View style = {{width: '100%', height: viewpager_Height}}>
                                <Swiper
                                    style={{}}
                                    containerStyle={{ alignSelf: 'stretch' }}
                                    loop = {true}
                                    removeClippedSubviews={false}
                                    dotColor = {'#979797'}
                                    activeDotColor = {'#ffffff'}
                                    autoplay = {true}
                                >
                                    {
                                        this.state.trending_list.map((item, index) => 
                                            <View key = {index} style = {{width: '100%', height: '100%'}}>
                                            {
                                                item.image1 !== "" &&
                                                <ImageBackground style = {{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}} resizeMode = {'cover'} source = {{uri: item.image1}}>
                                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'Lato-Regular'}}>{item.title}</Text>
                                                </ImageBackground>
                                            }
                                            {
                                                item.image1 === "" &&
                                                <ImageBackground style = {{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}} resizeMode = {'cover'} source = {require('../../assets/images/swiper_image.png')}>
                                                    <Text style = {{color: '#ffffff', fontSize: 20, fontFamily: 'Lato-Regular'}}>{item.title}</Text>
                                                </ImageBackground>
                                            }
                                            </View>
                                        )
                                    }
                                </Swiper>
                            </View>
                            <View style = {{width: '90%', height: toggle_viewHeight, flexDirection: 'row',marginLeft: 10}}>
                                <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                                    <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular'}}>Only show discounts with my card</Text>
                                </View>
                                <View style = {{width: '20%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                                    <ToggleSwitch
                                        isOn={this.state.togglestatus}
                                        size='small'
                                        onColor = '#ffffff'
                                        offColor = '#c0c0c0'
                                        onToggle={ (isOn) => this.toggleSwitch() }
                                    />
                                </View>
                            </View>
                        {
                            this.state.discounts_list.map((item, index) => 
                                <TouchableOpacity key = {index} style = {{width: '100%', flexDirection: 'row',justifyContent: 'center', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#808080'}} onPress = {() => this.display_discount_detail(item)}>
                                    <View style = {{width: 100, height: 100, }}>
                                    {
                                        item.image1 !== "" &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: item.image1}}/>
                                    }
                                     {
                                        item.image1 === "" &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}/>
                                    }   
                                    </View>
                                    <View style = {{width: deviceWidth * 0.9 - 100 - 10, marginLeft: 10}}>
                                        <View style = {{width: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                            <View style = {{width: '80%', justifyContent: 'center'}}>
                                                <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular'}} multiline = {true}>{item.title}</Text>
                                            </View>
                                            <View style = {{width: '20%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                                <TouchableOpacity onPress = {() => this.discount_like(item)}>
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
                                        <View style = {{width: '100%', justifyContent: 'center'}}>
                                        {
                                            item.detail != null &&
                                            <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular', marginTop: 5}} multiline = {true}>{item.detail}</Text>
                                            // <WebView source={{html: item.detail}} automaticallyAdjustContentInsets={false} style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}/>
                                        }
                                        </View>
                                        <View style = {{width: '100%', justifyContent: 'center', marginTop: 5}}>
                                            <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}} multiline = {true}>{item.place}</Text>
                                        </View>
                                        <View style = {{width: '100%', alignItems: 'center', flexDirection: 'row', marginTop: 5}}>
                                            <Image style = {{width: 18, height: 18}} resizeMode = {'contain'} source = {require('../../assets/images/ic_bell.png')}></Image>
                                            <Text style = {{color: '#bcc0c8', fontSize: 13, fontFamily: 'Lato-Regular'}} multiline = {true}>{item.expire_date}</Text>
                                        </View>
                                        <View style = {{width: '100%', alignItems: 'center', flexDirection: 'row', marginTop: 5}}>
                                            <Image style = {{width: 18, height: 18}} resizeMode = {'contain'} source = {require('../../assets/images/ic_tag.png')}></Image>
                                            <Text style = {{color: '#bcc0c8', fontSize: 13, fontFamily: 'Lato-Regular'}} multiline = {true}>{item.bank_title}</Text>
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



