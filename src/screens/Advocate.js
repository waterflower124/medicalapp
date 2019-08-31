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
import { TextInput } from 'react-native-gesture-handler';
import RadioForm from '../utils/component/radiobutton/SimpleRadioButton'
YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

var radio_props = [
    {label: 'Yes', value: 'Y' },
    {label: 'No', value: 'N' }
];

export default class Advocate extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            json_array: [],

            search_word: '',

		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    get_advocate_list = async() => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'signup/adv?query=' + this.state.search_word, {
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
            Alert.alert('Warning!', "Network error.");
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
        });
    }

    hidden_right_menu = () => {
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            json_array[i].clicked = false;
        }
        this.setState({
            json_array: json_array,
        });
    }

    set_advocate = async(item) => {
        this.hidden_right_menu();
        item.father = Global.user_name;
        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'signup/adv/' + item.id, {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(item)
        })
        .then(response => response.json())
        .then(async data => {
            
            var json_array = this.state.json_array;
            for(i = 0; i < json_array.length; i ++) {
                json_array[i]["clicked"] = false;
            }
            this.setState({
                json_array: json_array
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error.");
        });
        this.setState({showIndicator: false});
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
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Search Advocate</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, flexDirection: 'row', marginTop: 10}}>
                    <View style = {{width: '80%', height: '100%', flexDirection: 'row'}}>
                        <TextInput style = {styles.search_input_text} placeholder = {'Search Body Part/Organ'} returnKeyType = {'search'} onSubmitEditing = {() => this.get_advocate_list()}></TextInput>
                    </View>
                    <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress = {() => this.get_advocate_list()}>
                            <Image style = {{width: 30, height: 20, marginRight: 10}} resizeMode = {'contain'} source={require('../assets/images/search_icon.png')}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style = {{width: '95%', height: main_view_height - 40 - 10}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                    <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                    {
                        this.state.json_array.map((item, index) => 
                        <View key = {index} style = {styles.item_view}>
                            <View style = {{width: '80%', height: '100%'}}>
                                <View style = {styles.item_text_view}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>Full Name</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <Text style = {styles.item_text}>{item.paname}</Text>
                                    </View>
                                </View>
                                <View style = {styles.item_text_view}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>Phone #s</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <Text style = {styles.item_text}>{item.phone}</Text>
                                    </View>
                                </View>
                                <View style = {styles.item_text_view}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>Tags</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <Text style = {styles.item_text}>{item.paorg}</Text>
                                    </View>
                                </View>
                                <View style = {styles.item_text_view}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>Locations</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <Text style = {styles.item_text}>{item.paarea}</Text>
                                    </View>
                                </View>
                                <View style = {styles.item_text_view}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>Web Site</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <Text style = {styles.item_text}>{item.padesc}</Text>
                                    </View>
                                </View>
                                <View style = {[styles.item_text_view, {marginBottom: 10}]}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>Email Address</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <Text style = {styles.item_text}>{item.email}</Text>
                                    </View>
                                </View>
                                <View style = {[styles.item_text_view, {marginBottom: 10}]}>
                                    <View style = {styles.item_title_view}>
                                        <Text style = {styles.item_text}>BCPA</Text>
                                    </View>
                                    <View style = {styles.item_content_view}>
                                        <RadioForm
                                            radio_props={radio_props}
                                            initial={item.father == "YES" ? 0 : 1}
                                            formHorizontal={true}
                                            labelHorizontal={true}
                                            buttonSize={15}
                                            buttonColor={'#ff954c'}
                                            selectedButtonColor = {'#ff954c'}
                                            labelStyle = {{fontSize: 14, color: '#000000', marginRight: 5}}
                                            disabled = {true}
                                        />
 
                                    </View>
                                </View>
                            </View>
                            <View style = {styles.item_icon_view}>
                                <TouchableOpacity onPress = {() => this.select_right_menu(index)}>
                                    <Image style = {{width: 30, height: 20}} resizeMode = {'contain'} source={require('../assets/images/pending_lab_menu_right.png')}/>
                                </TouchableOpacity>
                            </View>
                            {
                                item.clicked &&
                                <View style = {[styles.right_menu_view, {zIndex: 1000-index}]}>
                                    <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.set_advocate(item)}>
                                        <Text style = {styles.right_menu_text}>Set as my advocate</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                        )
                    }
                    </ScrollView>
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
    search_input_text: {
        width: '100%',
        height: '100%',
        padding: 0,
        paddingLeft: 10
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
        fontSize: 15,
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
        height: 50,
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
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
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