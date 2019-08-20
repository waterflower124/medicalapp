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
    StatusBar
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
var toptab_viewHeight = 40;
var scollviewHeight = main_viewHeight - toptab_viewHeight;

export default class Saved extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
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

            selected_top_tab: 'discount', //  discount and card

            discount_likes_list: [],
            cards_likes_list: [],

            discounts_list: [],
            cards_list: [],

		}
    }
    
    async componentWillMount() {

    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_favorites.bind(this));
    }

    init_favorites = async() => {

        this.setState({showIndicator: true});
        //////   discount likes list    /////
        
        await fetch(Global.base_url + 'discount/discount_likes?token=' + Global.user_token,)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
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

        
        /////////  card  likes list   ////////////
        await fetch(Global.base_url + 'card/card_likes?token=' + Global.user_token)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
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

        ////////    discount list       //////////
        await fetch(Global.base_url + 'discount/search_discounts?token=' + Global.user_token + "&search_text=&with_user_card=1&category_id=all&filter=&sort_by=best&limit=20&offset=0")
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var discounts_list = [];
                var temp_discounts_list = data.data.data;
                var discount_likes_list = this.state.discount_likes_list;
                for(i = 0; i < temp_discounts_list.length; i ++) {
                    temp_discounts_list[i]["like"] = 0;
                    for(j = 0; j < discount_likes_list.length; j ++) {
                        if(temp_discounts_list[i].id == discount_likes_list[j].discount_id) {
                            if(discount_likes_list[j].like_status == "1") {
                                temp_discounts_list[i].like = 1;
                                discounts_list.push(temp_discounts_list[i]);
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

        ////////////   card list       ////////
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/search_cards?token=' + Global.user_token + "&search_text=&bank_id=all&sort_by=relevant&limit=20&offset=0")
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var cards_list = [];
                var temp_cards_list = data.data.data;
                var cards_likes_list = this.state.cards_likes_list;
                for(i = 0; i < temp_cards_list.length; i ++) {
                    temp_cards_list[i]["like"] = 0;
                    for(j = 0; j < cards_likes_list.length; j ++) {
                        if(temp_cards_list[i].id == cards_likes_list[j].card_id) {
                            if(cards_likes_list[j].like_status == "1") {
                                temp_cards_list[i].like = 1;
                                cards_list.push(temp_cards_list[i]);
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

    select_tab(tab_name) {
        this.setState({
            selected_top_tab: tab_name
        })
    }

    display_discount_detail = (item) => {
        Global.selected_discount = item;
        Global.previou_of_detail = "Saved";
        this.props.navigation.navigate("DiscountDetail", {selected_discount: item});
    }

    display_card_detail = (item) => {
        Global.selected_card = item;
        Global.previou_of_detail = "Saved";
        this.props.navigation.navigate("CardDetail", {selected_discount: item});
    }

    discount_like = async(item, index) => {
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
                'like': 0
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var discounts_list = this.state.discounts_list;
                discounts_list.splice(index, 1);
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

    card_like = async(item, index) => {
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
                'like': 0
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var cards_list = this.state.cards_list;
                cards_list.splice(index, 1);
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
                    <View style = {{width: '80%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Favorites</Text>
                    </View>
                    <View style = {{width: '20%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                        {/* <TouchableOpacity>
                            <Image style = {{width: 20, height: 20, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/ic_plus.png')}></Image>
                        </TouchableOpacity> */}
                    </View>
                </View>
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center'}}>
                    <View style = {{width: '100%', height: toptab_viewHeight, alignItems: 'center', flexDirection: 'row'}}>
                        <TouchableOpacity style = {[{width: '50%', height: 30, alignItems: 'center', justifyContent: 'center'}, this.state.selected_top_tab == "discount" ? {borderBottomWidth: 1, borderBottomColor: '#DC2F2F'} : null]} onPress = {() => this.select_tab('discount')}>
                            <Text style = {[{fontSize: 15, fontFamily: 'Lato-Regular'}, this.state.selected_top_tab == "discount" ? {color: '#000000'} : {color: '#A9A9B0'}]}>Discount</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {[{width: '50%', height: 30, alignItems: 'center', justifyContent: 'center'}, this.state.selected_top_tab == "card" ? {borderBottomWidth: 1, borderBottomColor: '#DC2F2F'} : null]} onPress = {() => this.select_tab('card')}>
                            <Text style = {[{fontSize: 15, fontFamily: 'Lato-Regular'}, this.state.selected_top_tab == "card" ? {color: '#000000'} : {color: '#A9A9B0'}]}>Card</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width: '100%', height: scollviewHeight}}>
                    {
                        this.state.selected_top_tab == 'discount' &&
                        <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                        {
                            this.state.discounts_list.map((item, index) => 
                                <TouchableOpacity key = {index} style = {{width: '100%', height: 120, flexDirection: 'row',justifyContent: 'center', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#808080'}} onPress = {() => this.display_discount_detail(item)}>
                                    <View style = {{width: 100, height: 100}}>
                                    {
                                        item.image1 !== "" &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: item.image1}}/>
                                    }
                                     {
                                        item.image1 === "" &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}/>
                                    }   
                                    </View>
                                    <View style = {{width: deviceWidth * 0.9 - 20 - 100, paddingLeft: 10, paddingRight: 10}}>
                                        <View style = {{width: '100%', height: '25%', flexDirection: 'row'}}>
                                            <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                                                <Text style = {{color: '#000000', fontSize: 15, fontFamily: 'Lato-Regular'}}>{item.title}</Text>
                                            </View>
                                            <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                                <TouchableOpacity onPress = {() => this.discount_like(item, index)}>
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
                                            item.detail != null &&
                                            <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>{item.detail}</Text>
                                        }
                                        </View>
                                        <View style = {{width: '100%', height: '18%', justifyContent: 'center'}}>
                                            <Text style = {{color: '#000000', fontSize: 13, fontFamily: 'Lato-Regular'}}>{item.place}</Text>
                                        </View>
                                        <View style = {{width: '100%', height: '18%', alignItems: 'center', flexDirection: 'row'}}>
                                            <Image style = {{width: 18, height: 18}} resizeMode = {'contain'} source = {require('../../assets/images/ic_bell.png')}></Image>
                                            <Text style = {{color: '#bcc0c8', fontSize: 13, fontFamily: 'Lato-Regular'}}>{item.expire_date}</Text>
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
                    }
                    {
                        this.state.selected_top_tab == 'card' &&
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
                                            <TouchableOpacity onPress = {() => this.card_like(item, index)}>
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
                    }
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
    
});



