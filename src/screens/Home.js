import React, {Fragment, Component} from 'react';
import {
    YellowBox,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Share,
  Platform,
  Alert,
  Animated
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'

const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../utils/Global/Global';
import AsyncStorage from '@react-native-community/async-storage';

YellowBox.ignoreWarnings(["Warning:"]);

const topOffset = getInset('top');
var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 50;
var top_view_height = 100;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var group_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - top_view_height : safearea_height - menu_bar_height - top_view_height - StatusBar.currentHeight;
var item_width = deviceWidth * 0.9 * 0.3;

export default class Home extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {
            showIndicator: false,

            item_array: [],
            final_score: 0,
            header_url: '',
            header_text: '',
            show_rightmenu: false,

            side_menu_show: false,

            coord_x: new Animated.Value(0)
        }
        
    }

    async UNSAFE_componentWillMount() {
    }


    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_dashboard.bind(this));
    }

 
    init_dashboard = async() => {
        this.setState({
            show_rightmenu: false
        })
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/dash/admin', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var item_array = [];
            for(i = 0; i < data.length; i ++) {
                if(data[i].position != 10) {
                    item_array.push(data[i]);
                } else {
                    this.setState({
                        final_score: data[i].cantidad
                    })
                    if(data[i].cantidad > 725) {
                        this.setState({
                            header_url: require('../assets/images/score725.png'),
                            header_text: 'Excellent'
                        })
                    } else if(data[i].cantidad > 675) {
                        this.setState({
                            header_url: require('../assets/images/score675.png'),
                            header_text: 'Good'
                        })
                    } else if(data[i].cantidad > 625) {
                        this.setState({
                            header_url: require('../assets/images/score625.png'),
                            header_text: 'Fair'
                        })
                    } else if(data[i].cantidad > 525) {
                        this.setState({
                            header_url: require('../assets/images/score525.png'),
                            header_text: 'Bad'
                        })
                    } else if(data[i].cantidad > 425) {
                        this.setState({
                            header_url: require('../assets/images/score425.png'),
                            header_text: 'Too Bad'
                        })
                    } else {
                        this.setState({
                            header_url: '',
                            header_text: 'None'
                        })
                    }
                }
            }
            this.setState({
                item_array: item_array
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    go_detail_screen = (item_title) => {
        this.props.navigation.navigate("ScoreFactors");
    }

    logout = async() => {
        Alert.alert("Logout", "Do you really want to log out?",
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: async() => {
                await AsyncStorage.setItem("signin_status", "false");
                this.props.navigation.navigate("Login")
            }}
        ],
        { cancelable: true })
        
    }

    animate_side_menu(target_screen) {
        var toValue = deviceWidth * 0.8;
        if(this.state.side_menu_show) {
            toValue = -deviceWidth * 0.8;
        };
        this.setState({
            side_menu_show: !this.state.side_menu_show
        })
        Animated.timing(
            this.state.coord_x,
            {
                toValue: toValue,
                velocity: 3,
                tension: 2,
                friction: 8,
            }
        ).start();
        if(target_screen == "Icd 10 Admin") {
            // this.props.navigation.navigate("OpenCase");
        } else if(target_screen == "Lab Admin") {
            // this.props.navigation.navigate("OpenCase");
        } else if(target_screen == "Symptom Admin") {
            // this.props.navigation.navigate("OpenCase");
        } else if(target_screen == "Cpt Admin") {
            // this.props.navigation.navigate("OpenCase");
        } else if(target_screen == "Icd 10 Warning Admin") {
            // this.props.navigation.navigate("OpenCase");
        }

    }


    render() {
        if(this.state.showIndicator)
        {
            return (
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                <View style = {{flex: 1}}>
                    <SkypeIndicator color = '#ffffff' />
                </View>
            </View>
            )
        }
        return (
        <SafeAreaView style = {styles.container}>
        {
            this.state.side_menu_show &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: 0.3, zIndex: 100}} onStartShouldSetResponder={() => this.animate_side_menu()}/>
        }

            <Animated.View style = {[styles.side_menu_view, {transform: [{translateX: this.state.coord_x}]}]}>
                <View style = {styles.side_menu_top_view}>
                    <View style = {styles.side_menu_logo_view}>
                        <Image style = {{height: '70%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/logo.png')}/>
                    </View>
                    <View style = {styles.side_menu_name_view}>
                        <Text style = {styles.side_menu_name_text}>{Global.user_name}</Text>
                    </View>
                </View>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Home")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_home.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Home</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Icd 10 Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_icdadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Icd 10 Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Lab Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_labadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Lab Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Symptom Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_symptomadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Symptom Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Cpt Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_cptadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Cpt Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Icd 10 Warning Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_icdwarningadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Icd 10 Warning Admin</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>


            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.animate_side_menu()}>
                        <Image style = {{width: 25, height: 25}} resizeMode = {'contain'} source={require('../assets/images/menu_left.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '65%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>EpatientIndex</Text>
                </View>
                <View style = {{width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => {this.setState({show_rightmenu: !this.state.show_rightmenu})}}>
                        <Image style = {{width: 25, height: 25}} resizeMode = {'contain'} source={require('../assets/images/menu_right.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        {
            this.state.show_rightmenu &&
            <View style = {{width: deviceWidth, height: deviceHeight, left: 0, right: 0, position: 'absolute', zIndex: 10}} onStartShouldSetResponder={() => this.setState({show_rightmenu: false})}/>
        }
        {
            this.state.show_rightmenu &&
            <View style = {styles.right_menu_view}>
                <TouchableOpacity style = {styles.menu_item_view}>
                    <Text style = {styles.menu_text}>My Account</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.menu_item_view}>
                    <Text style = {styles.menu_text}>Contact Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.menu_item_view}>
                    <Text style = {styles.menu_text}>Disclaimer</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.menu_item_view} onPress = {() => this.logout()}>
                    <Text style = {styles.menu_text}>Log out</Text>
                </TouchableOpacity>
            </View>
        }
            <View style = {{width: '100%', height: top_view_height, alignItems: 'center', padding: 5}}>
                <View style = {{width: '100%', height: '100%', flexDirection: 'row', backgroundColor: '#ffffff', borderColor: '#c0c0c0', borderWidth: 1}}>
                    <View style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <Image style = {{width: 80, height: 80}} resizeMode = {'contain'} source={this.state.header_url}/>
                    </View>
                    <View style = {{width: '40%', height: '100%', justifyContent: 'center'}}>
                        <Text style = {{fontSize: 16, color: '#ff0000', marginBottom: 5}}>{this.state.header_text}</Text>
                        <Text style = {{fontSize: 14, fontWeight: 'bold', color: '#000000', marginBottom: 5}}>e-Patient Index</Text>
                        <Text style = {{fontSize: 12, color: '#ff0000'}}>Lock at your Records</Text>
                    </View>
                    <View style = {{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style = {{fontSize: 24, fontWeight: 'bold', color: '#3aa1f4'}}>{this.state.final_score}</Text>
                    </View>
                </View>
            </View>
        {
            this.state.item_array.length != 0 &&
            <View style = {{width: '100%', height: group_view_height, alignItems: 'center', justifyContent: 'center'}}>
                <View style = {{width: deviceWidth * 0.9, height: deviceWidth * 0.9, justifyContent: 'space-between'}}>
                    <View style = {{width: '100%', height: '30%', justifyContent: 'space-between', flexDirection: 'row'}}>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("OpenCase")}>
                        {
                            this.state.item_array[0].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[0].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_open.png')}/>
                            <Text style = {styles.item_text}>Open Cases</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("CloseCase")}>
                        {
                            this.state.item_array[1].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[1].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_close.png')}/>
                            <Text style = {styles.item_text}>Close Cases</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("ScoreFactors")}>
                        {
                            this.state.item_array[2].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[2].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_board.png')}/>
                            <Text style = {styles.item_text}>Score Factors</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width: '100%', height: '30%', justifyContent: 'space-between', flexDirection: 'row'}}>
                        <TouchableOpacity style = {styles.item_style}>
                        {
                            this.state.item_array[3].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[3].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_chat.png')}/>
                            <Text style = {styles.item_text}>Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style}>
                        {
                            this.state.item_array[4].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[4].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_advice.png')}/>
                            <Text style = {styles.item_text}>Advice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("PendingLabs")}>
                        {
                            this.state.item_array[5].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[5].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_pendingwork.png')}/>
                            <Text style = {styles.item_text}>Pending Labs</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width: '100%', height: '30%', justifyContent: 'space-between', flexDirection: 'row'}}>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("PendingVisit", {prev_screen: "Home", caseNumber: -1})}>
                        {
                            this.state.item_array[6].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[6].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_pendingvisit.png')}/>
                            <Text style = {styles.item_text}>Pending Visits</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("Diagnosis")}>
                        {
                            this.state.item_array[7].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[7].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_heart.png')}/>
                            <Text style = {styles.item_text}>Diagnosis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style}>
                        {
                            this.state.item_array[8].cantidad != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array[8].cantidad}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_group.png')}/>
                            <Text style = {styles.item_text}>Advocate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        }
        </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        // alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    item_style: {
        width: '30%', 
        height: '100%', 
        borderWidth: 1, 
        borderColor: '#000000', 
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_icon: {
        width: '50%',
        height: '50%'
    },
    item_text: {
        fontSize: 12,
        color: '#000000'
    },
    badge_view: {
        width: 20,
        height: 20,
        top: 5,
        right: 5,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#ff0000'
    },
    badge_text: {
        fontSize: 10,
        color: '#ffffff'
    },
    right_menu_view: {
        width: 200,
        height: 160,
        position: 'absolute',
        top: menu_bar_height + topOffset,
        right: 5,
        backgroundColor: '#fafafa',
        zIndex: 10,
        borderColor: '#808080',
        borderWidth: 1
    },
    menu_item_view: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        paddingLeft: 5
    },
    menu_text: {
        fontSize: 16,
        color: '#000000'
    },

    side_menu_view: {
        width: deviceWidth * 0.8,
        height: safearea_height,
        position: 'absolute',
        left: -deviceWidth * 0.8,
        top: topOffset,
        backgroundColor: '#ffffff',
        zIndex: 200
    },
    side_menu_top_view: {
        width: '100%',
        height: 200,
        backgroundColor: '#455774'
    },
    side_menu_logo_view: {
        width: '100%',
        height: '70%',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    side_menu_name_view: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    side_menu_name_text: {
        fontSize: 20,
        color: '#ffffff'
    },
    side_menu_component_view: {
        width: '100%',
        height: 50,
        flexDirection: 'row'
    },
    side_menu_item_icon_view: {
        width: '20%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    side_menu_item_text_view: {
        width: '70%',
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 20
    },
    side_menu_item_text: {
        fontSize: 16,
        color: '#000000'
    },
})