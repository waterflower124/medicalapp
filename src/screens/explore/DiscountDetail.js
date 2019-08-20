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
    Linking
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
var cardview_height = 150;
var card_detail_view = 150;


export default class DiscountDetail extends Component {
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

            current_lat: Global.selectedLat,
            current_lng: Global.selectedLng,

            previous_screen: Global.previou_of_detail,

            selected_discount: Global.selected_discount,
            discount_image_array: [],
            discount_detail: {},
            card_detail: {},
            starCount: 0.0,

            map_region: {
                latitude: Global.selectedLat,
                longitude: Global.selectedLng,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015
            },

            restaruant_list: [],

            show_review_dialog: false,
            user_review: ''
		}
    }
    
    async componentWillMount() {

        if(Global.selected_discount.rating != null) {
            this.setState({
                starCount: parseFloat(Global.selected_discount.rating)
            })
        };

        fetch(Global.base_url + 'discount/discount_view?token=' + Global.user_token + '&discount_id=' + this.state.selected_discount.id)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                
            } else {
                // Alert.alert("Warning!", "There's error in server");
            }
            
        })
        .catch(function(error) {
            // Alert.alert('Warning!', 'Network error');
        });

        ///  get restaruant list
        if(Global.selectedLat != 0.0 && Global.selectedLng != 0.0) {
            this.get_restaruant_list(Global.selectedLat, Global.selectedLng);
        }

        //////////  geolocation access
        await this.requestAccess();
        
        await this.get_discount_detail();
        this.setState({
            isReady: true
        })

    };

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    get_restaruant_list = async(curr_lat, curr_lng) => {
            fetch('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + curr_lat + ',' + curr_lng + '&radius=10000&type=restaurant&key=' + Global.MAPAPIKEY)
            .then(response => response.json())
            .then(data => {
                if(data.status == "OK") {
                    var restaruant_list = []
                    for(i = 0; i < data.results.length; i ++) {
                        var markers = {
                            "title": data.results[i].name,
                            "coordinates": {
                                latitude: data.results[i].geometry.location.lat,
                                longitude: data.results[i].geometry.location.lng
                            }
                        }
                        restaruant_list.push(markers);
                        this.setState({
                            restaruant_list: restaruant_list
                        })
                    }
                } else {
                    // console.warn("error.message")
                }
            })
            .catch(function(error) {
                console.log(error);
                // Alert.alert('Warning!', 'Network error!yyyy');
            });
    }

    requestAccess = async () => {
        if(Platform.OS == "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'Location Permission',
                        'message': 'Wichz would like to access your location to get your things.'
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // console.warn("You can use locations ")
                } else {
                    // console.warn("Location permission denied")
                }
            } catch (err) {
                // console.warn(err)
            }
        }
        this.watchID = navigator.geolocation.watchPosition((position) => {
            this.setState({
                current_lat: position.coords.latitude,
                current_lng: position.coords.longitude,
                map_region: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02
                }
            });
            this.get_restaruant_list(position.coords.latitude, position.coords.longitude);
        }, (error)=>console.log(error.message),
        {enableHighAccuracy: false, timeout: 3, maximumAge: 1, distanceFilter: 1}
        );
    }

    get_discount_detail = async() => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'discount/discount_detail?token=' + Global.user_token + '&discount_id=' + this.state.selected_discount.id)
        .then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var discount_detail = data.data;
                // var discount_likes_list = Global.discounts_likes_list;
                // discount_detail['like'] = 0;
                // for(j = 0; j < discount_likes_list.length; j ++) {
                //     if(discount_detail.id == discount_likes_list[j].discount_id) {
                //         if(discount_likes_list[j].like_status == "1") {
                //             discount_detail['like'] = 1;
                //         } else {
                //             discount_detail['like'] = 0;
                //         }
                //         break;
                //     }
                // }
                this.setState({
                    card_detail: data.data.card,
                    discount_detail: discount_detail,
                })
                var discount_image_array = [];
                discount_image_array.push(data.data.image1);
                discount_image_array.push(data.data.image2);
                discount_image_array.push(data.data.image3);
                this.setState({
                    discount_image_array: discount_image_array,
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

    previous_screen() {
        if(this.state.previous_screen == "Saved") {
            this.props.navigation.navigate("Saved");
        } else if(this.state.previous_screen == "Explore") {
            this.props.navigation.navigate("Explore");
        } else {
            this.props.navigation.navigate("SearchDiscount");
        }
    }

    onStarRatingPress(rating) {
        this.setState({
          starCount: rating
        });
    }
   
    select_relate_discounts = async(selected_discount) => {
        this.setState({
            selected_discount: selected_discount
        }, () => {
            this.get_discount_detail();
        })
    }

    discount_like = async() => {
        var like = 0;
        if(this.state.selected_discount.like == 1) {
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
                'discount_id': this.state.selected_discount.id,
                'like': like
            })
        }).then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                var selected_discount = this.state.selected_discount;
                selected_discount.like = like;
                this.setState({selected_discount: selected_discount})
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
        if(this.state.card_detail.link != null && this.state.card_detail.link != "") {
            Linking.canOpenURL(this.state.card_detail.link).then(supported => {
                if (supported) {
                    Linking.openURL(this.state.card_detail.link);
                } else {
                    this.refs.toast.show("This card don't provide link");
                }
            });
        } else {
            this.refs.toast.show("This card don't provide link");
        }
    }

    share_link() {
        if(this.state.card_detail.link == "" || this.state.card_detail.link == null) {
            this.refs.toast.show("This card don't provide link");
            return;
        }
        if(Platform.OS == "android") {
            Share.share({
                message: this.state.card_detail.link,
            }).then(({action, activityType}) => {
                if(action === Share.sharedAction)
                    console.log('Share was successful');
                else
                    console.log('Share was dismissed');
            });
        } else {
            Share.share({
                url: this.state.card_detail.link
            }).then(({action, activityType}) => {
                if(action === Share.sharedAction)
                    console.log('Share was successful');
                else
                    console.log('Share was dismissed');
            });
        }
    }

    show_review_dialog() {
        this.setState({
            show_review_dialog: true
        })
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
        await fetch(Global.base_url + 'discount/discount_review', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': Global.user_token,
                'discount_id': this.state.selected_discount.id,
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
                        <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.discount_like()}>
                        {
                            this.state.selected_discount.like == 0 &&
                            <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_like_detail.png')}/>
                        }
                        {
                            this.state.selected_discount.like == 1 &&
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
                            <View style = {{width: '100%', height: viewpager_Height}}>
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
                                    this.state.discount_image_array.map((item, index) => 
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
                            <View style = {{width: '90%', height: cardview_height, borderBottomColor: '#dedede', borderBottomWidth: 1}}>
                                <View style = {{width: '100%', height: '50%', flexDirection: 'row', alignItems: 'center'}}>
                                    <Image style = {{height: '90%', aspectRatio: 1.6}} source = {{uri: this.state.card_detail.image1}}/>
                                    <View style = {{height: '90%', marginLeft: 10}}>
                                        <Text style = {styles.card_title_text}>{this.state.card_detail.title}</Text>
                                        <Text style = {styles.common_text}>Annual fee: ${this.state.card_detail.annual_fee}</Text>
                                    </View>
                                </View>
                                <View style = {{width: '100%', height: '50%', justifyContent: 'center'}}>
                                    <Text style = {[styles.common_text, {fontSize: 13}]}>Annual fee: $250</Text>
                                    <Text style = {[styles.common_text, {fontSize: 13}]}>Annual fee: $250</Text>
                                    <Text style = {[styles.common_text, {fontSize: 13}]}>Annual fee: $250</Text>
                                    <Text style = {[styles.common_text, {fontSize: 13}]}>Annual fee: $250</Text>
                                </View>
                                <TouchableOpacity style = {{position: 'absolute', width: 100, height: 60, right: 0, bottom: 20, borderRadius: 5, backgroundColor: '#ff0000', justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.open_card_link()}>
                                    <Text style = {[styles.card_title_text, {color: '#ffffff'}]}>Apply</Text>
                                    <Text style = {[styles.card_title_text, {color: '#ffffff'}]}>now</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{width: '90%', height: 30, marginTop: 5, flexDirection: 'row'}}>
                                <View style = {{width: '50%', height: '100%', alignItems: 'center', flexDirection: 'row'}}>
                                    <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_users.png')}/>
                                    <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>{parseInt(this.state.selected_discount.views_count, 10)}</Text>
                                    <Image style = {{width: 20, height: 20, marginLeft: 15}} resizeMode = {'contain'} source = {require('../../assets/images/ic_heart_fav.png')}/>
                                    <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>{parseInt(this.state.selected_discount.likes_count, 10)}</Text>
                                </View>
                                <View style = {{width: '50%', height: '100%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                                    <Text style = {[styles.common_text, {color: '#5d5d5d', marginRight: 10}]}>Review:</Text>
                                    <TouchableOpacity style = {{width: 100, height: '80%'}} onPress = {() => this.show_review_dialog()}>
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
                                <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>{this.state.selected_discount.detail}</Text>
                            </View>
                            <View style = {{width: '90%', marginTop: 5, flexDirection: 'row'}}>
                                <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/ic_gift.png')}/>
                                <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>Expires {this.state.discount_detail.expire_date}</Text>
                            </View>
                            <View style = {{width: '90%', marginTop: 5, flexDirection: 'row'}}>
                                <Image style = {{width: 20, height: 20, }} resizeMode = {'contain'} source = {require('../../assets/images/add_to_card.png')}/>
                                <Text style = {[styles.common_text, {color: '#5d5d5d', marginLeft: 10}]}>Automatically added to your card</Text>
                            </View>
                            <View style = {{width: '90%', marginTop: 5, flexDirection: 'row'}}>
                                <Text style = {[styles.common_text, {color: '#5d5d5d'}]}>Find starbucks nearby</Text>
                            </View>
                            <MapView style = {{width: '90%', height: 150}}
                                region = {this.state.map_region}
                            >
                                <MapView.Marker
                                    coordinate = {{
                                        latitude: this.state.current_lat,
                                        longitude: this.state.current_lng
                                    }}
                                    title = {"Current Location"}
                                    // description = {"Marker Description"}
                                />
                                {
                                    this.state.restaruant_list.map((item, index) => 
                                    <MapView.Marker
                                        key = {index}
                                        coordinate = {item.coordinates}
                                        title = {item.title}
                                        // description = {"Marker Description"}
                                    />
                                    )
                                }
                            </MapView>
                            <View style = {{width: '90%', marginTop: 20, flexDirection: 'row'}}>
                                <Text style = {[styles.common_text, {color: '#0061b3'}]}>Relevant</Text>
                            </View>
                            <View style = {{width: '90%', height: 100, marginTop: 5}}>
                                <ScrollView style = {{height: 100}} horizontal={true} showsHorizontalScrollIndicator = {false}>
                                {
                                    this.state.card_detail.discounts.map((item, index) =>
                                    <TouchableOpacity key = {index} style = {{width: 100, height: 100, borderRadius: 5, marginRight: 10, overflow: "hidden"}} onPress = {() => this.select_relate_discounts(item)}>
                                    {
                                        item.image1 == '' &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {require('../../assets/images/swiper_image.png')}/>
                                    }
                                    {
                                        item.image1 != '' &&
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: item.image1}}/>
                                    }   
                                    </TouchableOpacity>
                                    )
                                }
                                </ScrollView>
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
        )
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



