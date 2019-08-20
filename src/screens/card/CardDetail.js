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
    Linking,
    Share
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import Swiper from 'react-native-swiper'
import ToggleSwitch from '../../utils/component/togglebutton/ToggleSwitch'
import { SkypeIndicator } from 'react-native-indicators';
import StarRating from 'react-native-star-rating';
import MapView from 'react-native-maps';
import {AdMobBanner} from 'react-native-admob';
import Toast, {DURATION} from '../../utils/component/Toast'
import Global from '../../utils/Global/Global'
import {getInset} from 'react-native-safe-area-view'

const bottomOffset = getInset('bottom');

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var tabbarHeight = 50;
var topviewHeight = Platform.OS == 'android' ? 80 - StatusBar.currentHeight : 80;
var main_viewHeight = Platform.OS == 'android' ? deviceHeight - topviewHeight - (tabbarHeight + 5) - StatusBar.currentHeight : deviceHeight - topviewHeight - (tabbarHeight + 5) - bottomOffset;/// bottom tabbar height
var viewpager_Height = 200;
var cardview_height = 50;
var card_detail_view = 150;


export default class CardDetail extends Component {
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

            current_lat: 0.0,
            current_lng: 0.0,

            previous_screen: Global.previou_of_detail,

            selected_card: Global.selected_card,
            card_image_array: [],
            card_detail: {},
            starCount: 0.0,

            map_region: {},

            show_review_dialog: false,
            user_review: ''
		}
    }
    
    async componentWillMount() {

        this.setState({
            starCount: parseFloat(Global.selected_card.rating),
        })

        fetch(Global.base_url + 'card/card_view?token=' + Global.user_token + '&card_id=' + this.state.selected_card.id)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network error');
        });

        await this.get_card_detail();
        this.setState({
            isReady: true
        })

    };

    get_card_detail = async() => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/card_detail?token=' + Global.user_token + '&card_id=' + this.state.selected_card.id)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var card_image_array = [];
                card_image_array.push(data.data.image1);
                card_image_array.push(data.data.image2);
                card_image_array.push(data.data.image3);
                this.setState({
                    card_detail: data.data,
                    card_image_array: card_image_array,
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

    previous_screen() {
        if(this.state.previous_screen == "Saved") {
            this.props.navigation.navigate("Saved");
        } else if(this.state.previous_screen == "Card") {
            this.props.navigation.navigate("Card");
        } else {
            this.props.navigation.navigate("SearchCard");
        }
    }

    onStarRatingPress(rating) {
        this.setState({
          starCount: rating
        });
    }

    card_like = async() => {
        var like = 0;
        if(this.state.selected_card.like == 1) {
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
                'card_id': this.state.selected_card.id,
                'like': like
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var selected_card = this.state.selected_card;
                selected_card.like = like;
                      
                this.setState({
                    selected_card: selected_card
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

    open_card_link() {
        if(this.state.selected_card.link != null && this.state.selected_card.link != "") {
            Linking.canOpenURL(this.state.selected_card.link).then(supported => {
                if (supported) {
                    Linking.openURL(this.state.selected_card.link);
                } else {
                    this.refs.toast.show("This card don't provide link");
                }
            });
        } else {
            this.refs.toast.show("This card don't provide link");
        }
    }

    share_link() {
        if(this.state.selected_card.link == "" || this.state.selected_card.link == null) {
            this.refs.toast.show("This card don't provide link");
            return;
        }
        if(Platform.OS == "android") {
            Share.share({
                message: this.state.selected_card.link,
            }).then(({action, activityType}) => {
                if(action === Share.sharedAction)
                    console.log('Share was successful');
                else
                    console.log('Share was dismissed');
            });
        } else {
            Share.share({
                url: this.state.selected_card.link
            }).then(({action, activityType}) => {
                if(action === Share.sharedAction)
                    console.log('Share was successful');
                else
                    console.log('Share was dismissed');
            });
        }
    }

    handleReview = (typedText) => {
        this.setState({
            user_review: typedText
        })
    }

    add_review = async() => {
        if(this.state.user_review.trim() == '') {
            Alert.alert("Please input comment.");
            return;
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'card/card_review', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'card_id': this.state.selected_card.id,
                'rate': this.state.starCount,
                'comment': this.state.user_review
            })
        }).then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                this.setState({show_review_dialog: false})
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
                <Toast ref="toast"/>
            {
                this.state.show_review_dialog &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5}}>
                    <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3}}>
                    </View>
                    <View style = {{width: '80%', height: 250, backgroundColor: '#ffffff', borderRadius: 5}}>
                        <View style = {{width: '100%', height: '15%', paddingLeft: 20, justifyContent: 'center'}}>
                            <Text style = {[styles.card_title_text, {color: '#ff0000'}]}>Leave your review</Text>
                        </View>
                        <View style = {{width: '100%', height: '85%', justifyContent: 'center', alignItems: 'center'}}>
                            <View style = {{width: '100%', height: '30%', justifyContent: 'center', alignItems: 'center'}}>
                                <StarRating
                                    disabled={false}
                                    maxStars={5}
                                    rating={this.state.starCount}
                                    starSize = {30}
                                    emptyStarColor = {'#ffd487'}
                                    fullStarColor = {'#ffd487'}
                                    halfStarColor = {'#ffd487'}
                                    halfStarEnabled = {true}
                                    selectedStar={(rating) => this.onStarRatingPress(rating)}
                                />
                            </View>
                            <View style = {{width: '90%', height: '40%', borderRadius: 10, borderColor: '#c0c0c0', borderWidth: 1, padding: 5}}>
                                <TextInput style = {[styles.common_text, {width: '100%', height: '100%', textAlignVertical: "top"}]} placeholder = {'Comment'} multiline = {true} onChangeText = {this.handleReview}></TextInput>
                            </View>
                            <View style = {{width: '100%', height: '30%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                                <TouchableOpacity style = {[styles.review_button, {backgroundColor: '#ff0000'}]} onPress = {() => this.add_review()}>
                                    <Text style = {[styles.common_text, {color: '#ffffff'}]}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style = {[styles.review_button, {backgroundColor: '#ffffff'}]} onPress = {() => {this.setState({show_review_dialog: false})}}>
                                    <Text style = {[styles.common_text]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            }
                <View style = {{width: '100%', height: topviewHeight, flexDirection: 'row',  backgroundColor: '#3b3f46'}}>
                    <View style = {{width: '50%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <TouchableOpacity style = {{width: 20, height: 20, marginLeft: 10}} onPress = {() => this.previous_screen()}>
                            <Image style = {{width: '100%', height: '100%', }} resizeMode = {'contain'} source = {require('../../assets/images/back_button.png')}/>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width: '50%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'row'}}>
                        <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.card_like()}>
                        {
                            this.state.selected_card.like == 0 &&
                            <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_like_detail.png')}/>
                        }
                        {
                            this.state.selected_card.like == 1 &&
                            <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_heart_fav.png')}/>
                        }
                        </TouchableOpacity>
                        <TouchableOpacity style = {{marginRight: 10}} onPress = {() => this.share_link()}>
                            <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/share-arrow.png')}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style = {{width: '100%', height: main_viewHeight}}>
                    <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                        <View style = {{width: '100%', alignItems: 'center'}}>
                            <View style = {{width: '100%', height: viewpager_Height, backgroundColor: '#999999'}}>
                                <Swiper
                                    style={{}}
                                    containerStyle={{ alignSelf: 'stretch' }}
                                    loop = {true}
                                    removeClippedSubviews={false}
                                    dotColor = {'#979797'}
                                    activeDotColor = {'#ffffff'}
                                    autoplay = {true}
                                    index = {0}
                                >
                                {
                                    this.state.card_image_array.map((item, index) => 
                                        <View key = {index} style = {{width: '100%', height: '100%', backgroundColor: '#3b3f46', alignItems: 'center'}}>
                                        {
                                            item !== "" &&
                                            <Image style = {{width: '90%', height: '75%', marginTop: 10, borderRadius: 5}} resizeMode = {'cover'} source = {{uri: item}}/>
                                        }
                                        {
                                            item === "" &&
                                            <Image style = {{width: '90%', height: '75%', marginTop: 10, borderRadius: 5}} resizeMode = {'cover'} source = {require('../../assets/images/swiper_image.png')}/>
                                        }
                                        </View>
                                    )
                                }
                                </Swiper>
                            </View>
                            <View style = {{width: '90%', height: cardview_height, borderBottomColor: '#dedede', borderBottomWidth: 1, justifyContent: 'center'}}>
                                <Text style = {styles.card_title_text}>{this.state.selected_card.title}</Text>
                            </View>
                            <View style = {{width: '90%', height: 30, marginTop: 5, flexDirection: 'row'}}>
                                <View style = {{width: '50%', height: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                    <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_users.png')}/>
                                    <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>{parseInt(this.state.selected_card.views_count, 10)}</Text>
                                    <Image style = {{width: 20, height: 20, marginLeft: 15}} resizeMode = {'contain'} source = {require('../../assets/images/ic_heart_fav.png')}/>
                                    <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>{parseInt(this.state.selected_card.likes_count, 10)}</Text>
                                </View>
                                <View style = {{width: '50%', height: '100%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                                    <Text style = {[styles.common_text, {color: '#5d5d5d', marginRight: 10}]}>Review:</Text>
                                    <TouchableOpacity style = {{width: 100, height: '80%'}} onPress = {() => {this.setState({show_review_dialog: true})}}>
                                        <StarRating
                                            disabled={true}
                                            maxStars={5}
                                            rating={this.state.starCount}
                                            starSize = {20}
                                            emptyStarColor = {'#ffd487'}
                                            fullStarColor = {'#ffd487'}
                                            halfStarColor = {'#ffd487'}
                                            halfStarEnabled = {true}
                                            selectedStar={(rating) => this.onStarRatingPress(rating)}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style = {{width: '90%', marginTop: 5, flexDirection: 'row'}}>
                                <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/exclamation_mark.png')}/>
                                <View>
                                    <Text style = {[styles.common_text, {marginLeft: 10}]}>Earn 35,000 Membership Rewards® points after you spend $2,000 on purchases on your new Card in your first 3 months of Card Membership.†</Text>
                                    {
                                        this.state.selected_card.annual_fee == 0 &&
                                        <Text style = {[styles.common_text, {color: '#5d5d5d', margin: 10,}]}>No annual fee</Text>
                                    }
                                    {
                                        this.state.selected_card.annual_fee != 0 &&
                                        <Text style = {[styles.common_text, {color: '#5d5d5d', margin: 10,}]}>Annual fee: ${this.state.selected_card.annual_fee}</Text>
                                    }
                                </View>
                            </View>
                            <View style = {{width: '90%', marginTop: 5, flexDirection: 'row'}}>
                                <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_gift.png')}/>
                                <View>
                                    <Text style = {[styles.common_text, {fontSize: 13, marginLeft: 10}]}>4X MEMBERSHIP REWARDS® POINTS</Text>
                                    <Text style = {[styles.common_text, {fontSize: 13, marginLeft: 10}]}>$100 AIRLINE FEE CREDIT</Text>
                                    <Text style = {[styles.common_text, {fontSize: 13, marginLeft: 10}]}>$120 DINING CREDIT</Text>
                                    <Text style = {[styles.common_text, {fontSize: 13, marginLeft: 10}]}>NO FOREIGN TRANSACTION FEES</Text>
                                </View>
                            </View>
                            <View style = {{width: '90%', height: 50, justifyContent: 'center', borderBottomColor: '#dedede', borderBottomWidth: 1,}}>
                                <TouchableOpacity onPress = {() => this.open_card_link()}>
                                    <Text style = {[styles.common_text, {color: '#0000ff', textDecorationLine: 'underline'}]}>Check card page on line</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{width: '90%', height: 100, justifyContent: 'center', alignItems: 'center'}}>
                                <TouchableOpacity style = {{width: 150, height: 50, borderRadius: 10, backgroundColor: '#f04447', justifyContent: 'center', alignItems: 'center'}} onPress = {() => (this.share_link())}>
                                    <Text style = {[styles.card_title_text, {color: '#ffffff'}]}>Apply it now</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{marginTop: 10}}>
                                <AdMobBanner
                                    adSize="banner"
                                    adUnitID="ca-app-pub-3940256099942544/2934735716"
                                    // adUnitID="ca-app-pub-6227223164212840/2970458362"
                                    testDevices={[AdMobBanner.simulatorId]}
                                    onAdFailedToLoad={error => console.error(error)}
                                />
                            </View>
                        </View>
                    </ScrollView>
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
    card_title_text: {
        color: '#000000', 
        fontSize: 18,
        fontFamily: 'Lato-Regular', 
    },
    common_text: {
        color: '#000000', 
        fontSize: 15,
        fontFamily: 'Lato-Regular', 
    },
    review_button: {
        width: '40%',
        height: 40,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
});



