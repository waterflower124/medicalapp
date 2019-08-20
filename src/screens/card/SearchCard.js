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
import SlidingPanel from '../../utils/component/SlidingPanel';
import { SkypeIndicator } from 'react-native-indicators';
import { ConfirmDialog } from 'react-native-simple-dialogs';

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


export default class SearchCard extends Component {
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

            search_word: Global.search_word,
            cards_list: [],

            bank_list: Global.bank_list,
            selected_bank_inex: 0,

            slidingpanel_show: false,

            search_hotkeys: [],
            selected_sort_item: 'relevant',

            dialogVisible: false,
            add_hotkey: '',
		}
    }
    
    async componentWillMount() {

        this.setState({
            isReady: true,
            bank_list: Global.bank_list
        })

        await this.getCards();

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'discount/hot_keywords?token=' + Global.user_token,)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Global.search_hotkeys = data.data;
                this.setState({
                    search_hotkeys: data.data
                })
            } else {
                Alert.alert("Warning!", 'Email does not exist');
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});

        var search_hotkeys = this.state.search_hotkeys;
        for(i = 0; i < search_hotkeys.length; i ++) {
            search_hotkeys[i]["selected"] = false;
        }

        var hotkey = {"id": "-1", "title": "add button", "selected": false};
        search_hotkeys.push(hotkey);

        this.setState({
            search_hotkeys: search_hotkeys
        });
    };

    sort_item_select = async(selected_sort_item) => {
        this.setState({
            selected_sort_item: selected_sort_item
        })
    }

    randomColorFunction=()=>
    {
        var ColorCode = 'rgb(' + (Math.floor(Math.random() * 128)) + ',' + (Math.floor(Math.random() * 128)) + ',' + (Math.floor(Math.random() * 128)) + ')';
        return ColorCode;
    }

    getCards = async() => {
        this.setState({showIndicator: true});
        var bank_id;
        if(this.state.selected_bank_inex == 0) {
            bank_id = "all"
        } else {
            bank_id = this.state.bank_list[this.state.selected_bank_inex].id
        }
        await fetch(Global.base_url + 'card/search_cards?token=' + Global.user_token + "&search_text=" + this.state.search_word + "&bank_id=" + bank_id + "&sort_by=relevant&limit=20&offset=0")
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
                var cards_likes_list = Global.cards_likes_list;
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
            Alert.alert('Warning!', 'Network Error.');
        });
        
        this.setState({showIndicator: false});
    }

    filterWithBank = (bank_index) => {
        var bank_list = this.state.bank_list;
        if(bank_list[bank_index].selected) {
            bank_list[bank_index].color = 'rgb(192, 192, 192)';
            bank_list[bank_index].selected = false;
            
            var discounts_list = this.state.discounts_list;
            var index = 0;
            while(index < discounts_list.length) {
                if(discounts_list[index].bank_id == bank_list[bank_index].bank_id) {
                    discounts_list.splice(index, 1);
                } else {
                    index ++;
                }
            }
            
        } else {
            bank_list[bank_index].color = this.randomColorFunction();
            bank_list[bank_index].selected = true;

            var global_discounts_list = this.state.global_discounts_list;
            var discounts_list = this.state.discounts_list;
            
            for(i = 0; i < global_discounts_list.length; i ++) {
                if(global_discounts_list[i].bank_id == bank_list[bank_index].bank_id) {
                    discounts_list.push(global_discounts_list[i]);
                }
            }
        }
        
        this.setState({
            discounts_list: discounts_list,
            bank_list: bank_list
        })
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

    slidingpanel_show() {
        if(this.state.slidingpanel_show) {
            this.slidingpanel_ref.onRequestClose();
            this.setState({
                slidingpanel_show: false
            })
        } else {
            this.slidingpanel_ref.onRequestStart();
            this.setState({
                slidingpanel_show: true
            })
        }
    }

    handleSearchWord = (typedText) => {
        var search_hotkeys = this.state.search_hotkeys;
        for(i = 0; i < search_hotkeys.length; i ++) {
            if(typedText == search_hotkeys[i].title) {
                search_hotkeys[i].selected = true;
            } else {
                search_hotkeys[i].selected = false;
            }
        }
        this.setState({
            search_word: typedText,
            search_hotkeys: search_hotkeys
        })
    }

    searchSubmit = async() => {
        await this.getCards();
    }

    select_hot_tags = async(index) => {
        var search_hotkeys = this.state.search_hotkeys;
        for(i = 0; i < search_hotkeys.length; i ++) {
            if(i == index) {
                search_hotkeys[i].selected = true;
            } else {
                search_hotkeys[i].selected = false;
            }
        }
        this.setState({
            search_hotkeys: search_hotkeys,
            search_word: search_hotkeys[index].title
        });
    }

    handleHotKeyAdd = (typedText) => {
        this.setState({
            add_hotkey: typedText
        })
    }

    add_hot_tags = async() => {
        var search_hotkeys = this.state.search_hotkeys;
        search_hotkeys.splice(search_hotkeys.length - 1, 1);
        var new_id = parseInt(search_hotkeys[search_hotkeys.length - 1].id, 10) + 1
        var new_hotkey = {"id": new_id.toString(), "title": this.state.add_hotkey, "selected": false};
        var add_hotkey = {"id": "-1", "title": "add button", "selected": false};
        search_hotkeys.push(new_hotkey);
        search_hotkeys.push(add_hotkey);
        this.setState({
            dialogVisible: false,
            search_hotkeys: search_hotkeys
        });
    }

    filterDone = async() => {
        this.slidingpanel_ref.onRequestClose();
        this.setState({
            slidingpanel_show: false
        })
        this.getCards();
    }

    filterReset = async() => {
        this.slidingpanel_ref.onRequestClose();
        this.setState({
            slidingpanel_show: false
        });
        var search_hotkeys = this.state.search_hotkeys;
        for(i = 0; i < search_hotkeys.length; i ++) {
            search_hotkeys[i].selected = false;
        }
        this.setState({
            search_word: '',
            search_hotkeys: search_hotkeys,
            selected_sort_item: 'best'
        }, () => {this.getCards();})
    }

    display_card_detail = (item) => {
        Global.selected_card = item;
        Global.previou_of_detail = "SearchCard";
        this.props.navigation.navigate("CardDetail");
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
                <ConfirmDialog
                    title="Add Hot Key"
                    visible={this.state.dialogVisible}
                    onTouchOutside={() => this.setState({dialogVisible: false})}
                    positiveButton={{
                        title: "Add",
                        onPress: () => this.add_hot_tags()
                    }}
                    negativeButton={{
                        title: "Cancel",
                        onPress: () => this.setState({dialogVisible: false})
                    }} >
                    <View style = {{width: '100%', height: 30, justifyContent: 'center', alignItems: 'center'}}>
                        <TextInput style = {{width: '80%', height: '100%', fontFamily: 'Lato-Regular', fontSize: 15, padding: 0, paddingLeft: 10, paddingRight: 10, borderColor: '#808080', borderWidth: 1, borderRadius: 5}} autoCapitalize='none' autoCorrect={false} underlineColorAndroid='transparent' placeholder = {"Add Hot Key"} onChangeText = {this.handleHotKeyAdd}>{this.state.add_hotkey}</TextInput>
                    </View>
                </ConfirmDialog>
                <View style={styles.main_container}>
                    <View style = {{width: '90%', height: topviewHeight, flexDirection: 'row'}}>
                        <View style = {{width: '80%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                            <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>Search</Text>
                        </View>
                        <View style = {{width: '20%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                            <TouchableOpacity>
                                <Image style = {{width: 20, height: 20, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/ic_plus.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center'}}>
                        <View style = {{width: '90%', height: search_viewHeight, flexDirection: 'row', paddingTop: 5, paddingBottom: 5}}>
                            <View style = {{width: deviceWidth * 0.9 * 0.9, height: 30, borderRadius: 30, backgroundColor: '#D8D8D8', flexDirection: 'row', paddingLeft: 15, paddingRight: 15, alignItems:'center', justifyContent: 'center'}}>
                                <Image style = {{height: 20, width: 20}} resizeMode = {'contain'} source = {require('../../assets/images/ic_search_inview.png')}></Image>
                                <TextInput style = {{width: deviceWidth * 0.9 * 0.9 - 20 - 30, height: 25, fontFamily: 'Lato-Regular', fontSize: 15, padding: 0}} autoCapitalize='none' autoCorrect={false} underlineColorAndroid='transparent' placeholder = {"Search card, discount and offer"} returnKeyType = {'search'} onSubmitEditing = {this.searchSubmit} onChangeText = {this.handleSearchWord}>{this.state.search_word}</TextInput>
                            </View>
                            <View style = {{width: deviceWidth * 0.9 * 0.1, height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                                <TouchableOpacity style = {{height: 25, width: 25}} onPress = {() => {this.slidingpanel_show()}}>
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
                        <View style = {{width: '90%', height: scollviewHeight}}>
                            <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                                <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>{this.state.cards_list.length} Results Found</Text>
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
                <SlidingPanel
                    ref = {slidingpanel_ref => {this.slidingpanel_ref = slidingpanel_ref}}
                    AnimationSpeed = {500}
                    headerLayoutHeight = {50}
                    headerLayout = { () =>
                        <View style={styles.headerLayoutStyle}>
                            <View style = {{width: '100%', height: '30%', justifyContent: 'center', alignItems: 'center'}}>
                                <View style = {{width: 50, height: 3, borderRadius: 3, backgroundColor: '#808080'}}/>
                            </View>
                            <View style = {{width: '90%', height: '70%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}}>
                                <TouchableOpacity onPress = {() => this.filterReset()}>
                                    <Text style={styles.commonTextStyle}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text style={styles.commonTextStyle}>Filters</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress = {() => this.filterDone()}>
                                    <Text style={styles.commonTextStyle}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    slidingPanelLayoutHeight = {330}
                    slidingPanelLayout = { () =>
                        <View style={styles.slidingPanelLayoutStyle}>
                            <View style = {{width: '95%', height: '100%'}}>
                                <View style = {{marginTop: 10, marginBottom: 10}}>
                                    <Text style = {styles.hottag_title_text}>HOT TAGS</Text>
                                </View>
                                <View style={{width: '100%', flexDirection: 'row', flexWrap: 'wrap'}}>
                                {
                                    this.state.search_hotkeys.map((item, index) => 
                                        <View key = {index}>
                                        {
                                            item.id != "-1" &&
                                            <TouchableOpacity style = {[styles.hottag_view, this.state.search_hotkeys[index].selected ? {borderColor: '#ff0000'} : null]} onPress = {() => this.select_hot_tags(index)}>
                                                <Text style = {[styles.hottag_title_text, this.state.search_hotkeys[index].selected ? {color: '#ff0000'} : null]}>{item.title}</Text>
                                            </TouchableOpacity>
                                        }
                                        {
                                            item.id == "-1" &&
                                            <TouchableOpacity style = {styles.hottag_add_view} onPress = {() => {this.setState({dialogVisible: true})}}>
                                                <Image style = {{width: 20, height: 20}} resizeMode = {'stretch'} source = {require('../../assets/images/ic_plus.png')}></Image>
                                            </TouchableOpacity>
                                        }
                                        </View>
                                    )
                                }
                                </View>
                                <View style = {{marginTop: 10, marginBottom: 10}}>
                                    <Text style = {styles.hottag_title_text}>SORT BY</Text>
                                </View>
                                <TouchableOpacity style = {styles.sort_itemview} onPress = {() => this.sort_item_select("relevant")}>
                                    <Text style = {[styles.commonTextStyle, this.state.selected_sort_item === "relevant" ? {color: '#ff0000'} : null]}>Relevant</Text>
                                {
                                    this.state.selected_sort_item === "relevant" &&
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'stretch'} source = {require('../../assets/images/keepsignin_check.png')}></Image>
                                }
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.sort_itemview} onPress = {() => this.sort_item_select("review")}>
                                    <Text style = {[styles.commonTextStyle, this.state.selected_sort_item === "review" ? {color: '#ff0000'} : null]}>Review</Text>
                                {
                                    this.state.selected_sort_item === "review" &&
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'stretch'} source = {require('../../assets/images/keepsignin_check.png')}></Image>
                                }
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.sort_itemview} onPress = {() => this.sort_item_select("likes")}>
                                    <Text style = {[styles.commonTextStyle, this.state.selected_sort_item === "likes" ? {color: '#ff0000'} : null]}>Likes</Text>
                                {
                                    this.state.selected_sort_item === "likes" &&
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'stretch'} source = {require('../../assets/images/keepsignin_check.png')}></Image>
                                }
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    main_container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    bank_button: {
        height: 30,
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        marginBottom: 5,
        marginRight: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    headerLayoutStyle: {
        width: deviceWidth, 
        height: 50, 
        backgroundColor: '#ffffff', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 1,
        borderTopColor: '#000000',
        borderLeftColor: '#000000',
        borderRightColor: '#000000',
        borderBottomColor: '#c0c0c0'
      },
      slidingPanelLayoutStyle: {
        width: deviceWidth, 
        height: 330, 
        backgroundColor: '#ffffff', 
        // justifyContent: 'center', 
        alignItems: 'center',
      },
      commonTextStyle: {
        color: '#000000', 
        fontSize: 15,
        fontFamily: 'Lato-Regular', 
      },
      hottag_title_text: {
        color: '#c0c0c0', 
        fontSize: 13,
        fontFamily: 'Lato-Regular', 
      },
      hottag_view: {
        height: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#c0c0c0',
        justifyContent: 'center',
        marginBottom: 5,
        paddingLeft: 10,
        paddingRight: 10
      },
      hottag_add_view: {
        height: 30,
        justifyContent: 'center',
        marginBottom: 5,
        paddingLeft: 10,
        paddingRight: 10
      },
      sort_itemview: {
        width: '100%', 
        height: 30, 
        borderBottomWidth:1, 
        borderBottomColor: '#c0c0c0',
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
});



