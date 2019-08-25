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
  TouchableWithoutFeedback
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../utils/Global/Global'

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class OpenCase extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            json_array: [],

            add_new_click: false,
            right_menu_clicked: false,
		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_opencase.bind(this));
    }

    init_opencase = async() => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/medcase?userName=' + Global.profile_user_name + '&type=A', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var json_array = data;
            for(i = 0; i < json_array.length; i ++) {
                json_array[i]["clicked"] = false;
            }
            this.setState({
                json_array: json_array
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Networl error.");
        });
        this.setState({showIndicator: false});
    }

    select_right_menu = (index) => {
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            if(i == index) {
                json_array[i].clicked = !json_array[i].clicked;
            } else {
                json_array[i].clicked = false;
            }
        }
        this.setState({
            json_array: json_array,
            right_menu_clicked: true
        });
    }

    hidden_right_menu = () => {
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            json_array[i].clicked = false;
        }
        this.setState({
            json_array: json_array,
            right_menu_clicked: false,
            add_new_click: false
        });
    }

    delete_alert = async(index, status_code) => {
        var json_array = this.state.json_array;
        json_array[index].clicked = !json_array[index].clicked;
        this.setState({
            json_array: json_array
        });
        Alert.alert('Notice!', 'Do you really delete this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.update_case(index, status_code)},
        ],
        { cancelable: true })
    };

    update_case = async(index, status_code) => {
        var item = this.state.json_array[index];
        item.caseStatus = status_code;
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/medcase/' + item.id, {
            method: "PUT",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(item)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            var json_array = this.state.json_array;
            json_array.splice(index, 1);
            this.setState({
                json_array: json_array
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    close_alert = async(index, status_code) => {
        var json_array = this.state.json_array;
        json_array[index].clicked = !json_array[index].clicked;
        this.setState({
            json_array: json_array
        });
        Alert.alert('Notice!', 'Do you really close this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.update_case(index, status_code)},
        ],
        { cancelable: true })
    };

    create_new_case() {
        this.hidden_right_menu();
        this.setState({
            add_new_click: false
        })
        this.props.navigation.navigate("NewCase");
    }

    go_opencase(item) {
        if(this.state.right_menu_clicked) {
            this.hidden_right_menu();
        } else {
            this.props.navigation.navigate("PendingVisit", {prev_screen: "OpenCase", caseNumber: item.id, doctorName: item.doctorName, hospitalName: item.hospitalName});
        }
    }


    render() {

        return (
        <SafeAreaView style = {styles.container}>
        {
            this.state.showIndicator &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                <View style = {{flex: 1}}>
                    <SkypeIndicator color = '#ffffff' />
                </View>
            </View>
        }
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Open Cases</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                {
                    this.state.json_array.map((item, index) => 
                    <View key = {index} style = {styles.item_view}>
                        <TouchableOpacity style = {{width: '80%', height: '100%'}} onPress = {() => this.go_opencase(item)}>
                            <View style = {styles.item_text_view}>
                                <View style = {styles.item_title_view}>
                                    <Text style = {styles.item_text}>Date</Text>
                                </View>
                                <View style = {styles.item_content_view}>
                                    <Text style = {styles.item_text}>{item.caseDate}</Text>
                                </View>
                            </View>
                            <View style = {styles.item_text_view}>
                                <View style = {styles.item_title_view}>
                                    <Text style = {styles.item_text}>Body Part</Text>
                                </View>
                                <View style = {styles.item_content_view}>
                                    <Text style = {styles.item_text}>{item.partName}</Text>
                                </View>
                            </View>
                            <View style = {styles.item_text_view}>
                                <View style = {styles.item_title_view}>
                                    <Text style = {styles.item_text}>Hospital</Text>
                                </View>
                                <View style = {styles.item_content_view}>
                                    <Text style = {styles.item_text}>{item.hospitalName}</Text>
                                </View>
                            </View>
                            <View style = {styles.item_text_view}>
                                <View style = {styles.item_title_view}>
                                    <Text style = {styles.item_text}>Main Doctor</Text>
                                </View>
                                <View style = {styles.item_content_view}>
                                    <Text style = {styles.item_text}>{item.doctorName}</Text>
                                </View>
                            </View>
                            <View style = {styles.item_text_view}>
                                <View style = {styles.item_title_view}>
                                    <Text style = {styles.item_text}>Description</Text>
                                </View>
                                <View style = {styles.item_content_view}>
                                    <Text style = {styles.item_text}>{item.description}</Text>
                                </View>
                            </View>
                            <View style = {[styles.item_text_view, {marginBottom: 10}]}>
                                <View style = {styles.item_title_view}>
                                    <Text style = {styles.item_text}>Score</Text>
                                </View>
                                <View style = {styles.item_content_view}>
                                    <Text style = {styles.item_text}>{item.pampIndex}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style = {styles.item_icon_view}>
                            <TouchableOpacity onPress = {() => this.select_right_menu(index)}>
                                <Image style = {{width: 30, height: 20}} resizeMode = {'contain'} source={require('../assets/images/pending_lab_menu_right.png')}/>
                            </TouchableOpacity>
                        </View>
                        {
                            item.clicked &&
                            <View style = {[styles.right_menu_view, {zIndex: 1000-index}]}>
                                <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.close_alert(index, "C")}>
                                    <Text style = {styles.right_menu_text}>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.delete_alert(index, "D")}>
                                    <Text style = {styles.right_menu_text}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                    )
                }
                </ScrollView>
                <View style = {[styles.add_new, this.state.add_new_click ? {height: 100} : {height: 50}]}>
                {
                    this.state.add_new_click &&
                    <TouchableOpacity style = {styles.new_case_button} onPress = {() => this.create_new_case()}>
                        <View style = {{width: '70%', height: '60%', backgroundColor: '#3a393a', justifyContent: 'center', alignItems: 'center', borderRadius: 5}}>
                            <Text style = {{fontSize: 13, color: '#ffffff'}}>Start a New Case</Text>
                        </View>
                        <View style = {{width: '30%', height: '60%', justifyContent: 'center', alignItems: 'flex-end'}}>
                            <Image style = {{height: '100%'}} resizeMode = {'contain'} source={require('../assets/images/new_case_button.png')}/>
                        </View>
                    </TouchableOpacity>
                }
                    <View style = {[{width: '100%', justifyContent: 'center', alignItems: 'flex-end'}, this.state.add_new_click ? {height: '50%'} : {height: '100%'}]}>
                        <TouchableOpacity style = {styles.add_new_button} onPress = {() => this.setState({add_new_click: !this.state.add_new_click, right_menu_clicked: true})}>
                        {
                            this.state.add_new_click &&
                            <Image style = {{height: '100%'}} resizeMode = {'contain'} source={require('../assets/images/new_case_cancel.png')}/>
                        }
                        {
                            !this.state.add_new_click &&
                            <Image style = {{height: '100%'}} resizeMode = {'contain'} source={require('../assets/images/new_case_add.png')}/>
                        }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
    item_view: {
        width: '100%', 
        marginTop: 10,
        borderColor: '#c0c0c0',
        borderWidth: 1,
        flexDirection: 'row',
    },
    item_text_view: {
        width: '100%',
        // height: 40,
        flexDirection: 'row',
        marginTop: 10
    },
    item_title_view: {
        width: '40%',
        // height: '100%',
        // justifyContent: 'center',
        paddingLeft: 10
    },
    item_content_view: {
        width: '60%',
        // height: '100%',
        // justifyContent: 'center',
    },
    item_text: {
        fontSize: 16,
        color: '#000000'
    },
    item_icon_view: {
        width: '20%',
        // height: '100%',
        // justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 10,
        marginTop: 10,
        zIndex: 10
    },
    right_menu_view: {
        width: 150,
        height: 100,
        position: 'absolute',
        top: 40,
        right: 0,
        borderWidth: 1,
        borderColor: '#c0c0c0',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        paddingLeft: 10
    },
    right_menu_item: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        marginLeft: 10
    },
    right_menu_text: {
        fontSize: 14,
        color: '#000000'
    },
    add_new: {
        width: 180,
        // height: 100,
        position: 'absolute',
        right: 20,
        bottom: 20,
        zIndex: 1000
    },
    new_case_button: {
        width: '100%',
        height: '50%',
        flexDirection: 'row'
    },
    add_new_button: {
        height: '80%',
        justifyContent: 'center'
    }
})