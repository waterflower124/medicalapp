import React, {Fragment, Component} from 'react';
import {
    YellowBox,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    // TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    Share,
    Platform,
    Alert,
    TouchableOpacity,
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

// var item_y_pos_array = [];

export default class PendingLabs extends Component {
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

            item_y_pos_array: [],
            selected_right_menu_index: -1
		}
    }

    async UNSAFE_componentWillMount() {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/lab?userName=' + Global.profile_user_name, {
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
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    componentDidMount() {
        
    }

    onLayoutEvent(layout) {
        const {x, y, width, height} = layout;
        var item_y_pos_array = this.state.item_y_pos_array;
        item_y_pos_array.push(y);
        this.setState({
            item_y_pos_array: item_y_pos_array
        })
       
    }

    right_menu_view_style = function() {
        // console.warn(this.state.item_y_pos_array);
        return {
            width: 150,
            height: 200,
            position: 'absolute',
            top: this.state.item_y_pos_array[this.state.selected_right_menu_index] + 20,
            right: 0,
            borderWidth: 1,
            borderColor: '#c0c0c0',
            backgroundColor: '#ffffff',
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

    show_alert = (action_type) => {
        var json_array = this.state.json_array;
        json_array[this.state.selected_right_menu_index].clicked = !json_array[this.state.selected_right_menu_index].clicked;
        this.setState({
            json_array: json_array,
            right_menu_clicked: false,
        });
        Alert.alert('Notice!', 'Are you sure?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.update_lab(this.state.selected_right_menu_index, action_type)},
        ],
        { cancelable: true })
    }

    update_lab = async(index, action_type) => {
        this.setState({
            selected_right_menu_index: -1
        });
        var item = this.state.json_array[index];
        item.labStatus = action_type;
        var fetch_method = "";
        if(action_type == "D") {
            fetch_method = "DELETE";
        } else {
            fetch_method = "PUT";
        }
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/lab/' + item.id, {
            method: fetch_method,
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
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Pending Labs</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{paddingBottom: 200}}>
                    {
                        this.state.json_array.map((item, index) => 
                        <View key = {index} style = {{width: '100%', flexDirection: 'row', marginTop: 20, zIndex: 1000-index}} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout)}}>
                            <View style = {{width: '90%'}}>
                                <Text style = {styles.item_text} multiline = {true}>{item.labDesc}</Text>
                            </View>
                            <View style = {{width: '10%', alignItems: 'flex-end', marginRight: 10}}>
                                <TouchableOpacity onPress = {() => this.select_right_menu(index)}>
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/pending_lab_menu_right.png')}/>
                                </TouchableOpacity>
                            </View>
                            {/* {
                                item.clicked &&
                                <View style = {[styles.right_menu_view, {zIndex: 1000-index}]}>
                                    <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert(index, "D")}>
                                        <Text style = {styles.right_menu_text}>Delete</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert(index, "N")}>
                                        <Text style = {styles.right_menu_text}>Negative</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert(index, "P")}>
                                        <Text style = {styles.right_menu_text}>Positive</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert(index, "I")}>
                                        <Text style = {styles.right_menu_text}>Inconclusive</Text>
                                    </TouchableOpacity>
                                </View>
                            } */}
                        </View>
                        )
                    }
                    {
                        this.state.right_menu_clicked &&
                        <View style = {this.right_menu_view_style()}>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert("D")}>
                                <Text style = {styles.right_menu_text}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert("N")}>
                                <Text style = {styles.right_menu_text}>Negative</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert("P")}>
                                <Text style = {styles.right_menu_text}>Positive</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert("I")}>
                                <Text style = {styles.right_menu_text}>Inconclusive</Text>
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
    item_text: {
        fontSize: 16,
        color: '#000000'
    },
    right_menu_view: {
        width: 150,
        height: 200,
        position: 'absolute',
        top: 20,
        right: 0,
        borderWidth: 1,
        borderColor: '#c0c0c0',
        backgroundColor: '#ffffff',
    },
    right_menu_item: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        marginLeft: 10,
    },
    right_menu_text: {
        fontSize: 14,
        color: '#000000'
    },
})