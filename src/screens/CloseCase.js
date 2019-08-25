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
  Alert
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

var item_y_pos_array = [];

export default class CloseCase extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            json_array: [],
            right_menu_clicked: false,

            selected_right_menu_index: -1
		}
    }

    async UNSAFE_componentWillMount() {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/medcase?userName=' + Global.profile_user_name + '&type=C', {
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
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})
    }

    onLayoutEvent(layout) {
        const {x, y, width, height} = layout;
        item_y_pos_array.push(y);
    }

    right_menu_view_style = function() {
        return {
            width: 150,
            height: 100,
            position: 'absolute',
            top: item_y_pos_array[this.state.selected_right_menu_index] + 40,
            right: 0,
            borderWidth: 1,
            borderColor: '#c0c0c0',
            backgroundColor: '#ffffff',
            paddingLeft: 10,
            zIndex: 1000
        }
        
    }

    select_right_menu = (index) => {
        this.setState({
            selected_right_menu_index: index
        })
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
            selected_right_menu_index: -1
        });
    }

    delete_alert = async(caseStatus) => {
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            json_array[i].clicked = false;
        }
        this.setState({
            json_array: json_array,
            right_menu_clicked: false,
        });
        Alert.alert('Notice!', 'Do you really delete this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.update_case(this.state.selected_right_menu_index, caseStatus)},
        ],
        { cancelable: true })
    };

    update_case = async(index, caseStatus) => {
        var item = this.state.json_array[index];
        item.caseStatus = caseStatus;
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/medcase/' + item.id, {
            method: "PUT",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(item)
        })
        .then(response => response.json())
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

    reopen_alert = async(caseStatus) => {
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            json_array[i].clicked = false;
        }
        this.setState({
            json_array: json_array,
            right_menu_clicked: false,
        });
        Alert.alert('Notice!', 'Do you really re-open this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.update_case(this.state.selected_right_menu_index, caseStatus)},
        ],
        { cancelable: true })
    };

    go_next_screen(item) {
        if(this.state.right_menu_clicked) {
            this.hidden_right_menu()
        } else {
            this.props.navigation.navigate("PendingVisit", {prev_screen: "CloseCase", caseNumber: item.id});
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
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Close Cases</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{width: '100%', paddingBottom: 150}}>
                    {
                        this.state.json_array.map((item, index) => 
                        <View key = {index} style = {styles.item_view} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout)}}>
                            <TouchableOpacity style = {{width: '80%', height: '100%'}} onPress = {() => this.go_next_screen(item)}>
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
                        </View>
                        )
                    }
                    {
                        this.state.right_menu_clicked &&
                        <View style = {this.right_menu_view_style()}>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.reopen_alert("A")}>
                                <Text style = {styles.right_menu_text}>Re-open</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.delete_alert("D")}>
                                <Text style = {styles.right_menu_text}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    </View>
                </ScrollView>
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
        flexDirection: 'row'
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
        marginTop: 10
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
})