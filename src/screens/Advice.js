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

export default class Advice extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            header_array: [],
            content_array: [],
            prev_screen: props.navigation.state.params.prev_screen,
		}
    }

    async UNSAFE_componentWillMount() {

        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/advice', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var response_array = data;
            var header_array = [];
            var content_array = [];
            var each_header;
            var json_array_index = 0;
            for(i = 0; i < response_array.length; i ++) {
                adviceCode_array = response_array[i].adviceCode.split('-');
                if(adviceCode_array[1] == "0") {
                    each_header = response_array[i];
                    each_header.firstCode = adviceCode_array[0];
                    each_header.lastCode = adviceCode_array[1];
                    each_header.expand = false;
                    header_array.push(each_header);
                } 
            }
            for(j = 0; j < header_array.length; j ++) {
                content_array[j] = [];
            }
            for(i = 0; i < response_array.length; i ++) {
                adviceCode_array = response_array[i].adviceCode.split('-');
                for(j = 0; j < header_array.length; j ++) {
                    if(adviceCode_array[0] == header_array[j].firstCode && adviceCode_array[1] != 0) {
                        content_array[j].push(response_array[i]);
                        break;
                    }
                }
            }
            this.setState({
                header_array: header_array,
                content_array: content_array
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})
    }

    click_item = (index) => {
        var header_array = this.state.header_array;
        header_array[index].expand = !header_array[index].expand;
            this.setState({
                header_array: header_array
            })
    }

    go_home() {
        if(this.state.prev_screen == "patient") {
            this.props.navigation.navigate("Home");
        } else {
            this.props.navigation.navigate("AdvocateHome");
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
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_home()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Advice</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_home()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height}}>
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.header_array.map((item, index) => 
                    <View key = {index} style = {{width: '100%'}}>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.click_item(index)}>
                            <View style = {styles.item_arrow_view}>
                            {
                                item.expand &&
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/up_arrow.png')}/>
                            }
                            {
                                !item.expand &&
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/down_arrow.png')}/>
                            }
                            </View>
                            <View style = {styles.item_text_view}>
                                <Text style = {styles.item_text}>{item.adviceDesc}</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            item.expand && (
                                this.state.content_array[index].map((sub_item, sub_index) => 
                                <View key = {sub_index} style = {{width: '100%'}}>
                                    <View style = {{borderBottomColor: '#c0c0c0', borderBottomWidth: 1, paddingLeft: 50, paddingTop: 10, paddingBottom: 10}}>
                                        <Text style = {[styles.item_text, {color: '#ff0000'}]}>{sub_item.adviceDesc}</Text>
                                    </View>
                                </View>
                                )
                            )
                                
                        }
                    </View>
                    )
                    
                }
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
    item_style: {
        width: '100%',
        // height: 40,
        borderBottomColor: '#c0c0c0',
        borderBottomWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10
    },
    item_arrow_view: {
        width: 40,
        // height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_text_view: {
        // width: '70%',
        // height: '100%',
        justifyContent: 'center'
    },
    item_text: {
        fontSize: 16,
        color: '#000000'
    }
})