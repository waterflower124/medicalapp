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

export default class ScoreFacotrs extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            json_array: []
		}
    }

    async UNSAFE_componentWillMount() {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/factor?userName=' + Global.profile_user_name, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var json_array = data;
            for(i = 0; i < json_array.length; i ++) {
                json_array[i]["expand"] = false;
                json_array[i].goods["expand"] = false;
                json_array[i].bads["expand"] = false;
                json_array[i].warnings["expand"] = false;
            }
            this.setState({
                json_array: json_array
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})
    }

    click_item = (item_type, parent_index, child_index) => {
        if(item_type == "parent") {
            var json_array = this.state.json_array;
            json_array[parent_index].expand = !json_array[parent_index].expand ;
            this.setState({
                json_array: json_array
            })
        } else if(item_type == "child") {
            var json_array = this.state.json_array;
            if(child_index == 0) {
                json_array[parent_index].bads.expand = !json_array[parent_index].bads.expand;
            } else if(child_index == 1) {
                json_array[parent_index].goods.expand = !json_array[parent_index].goods.expand;
            } else if(child_index == 2) {
                json_array[parent_index].warnings.expand = !json_array[parent_index].warnings.expand;
            }
            this.setState({
                json_array: json_array
            })
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
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Score Factors</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height}}>
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.json_array.map((item, index) => 
                    <View key = {index} style = {{width: '100%'}}>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.click_item("parent", index, -1)}>
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
                                <Text style = {styles.item_text}>{item.partName}</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            item.expand &&
                                <View style = {{width: '100%'}}>
                                    <TouchableOpacity style = {[styles.item_style, {paddingLeft: 10}]} onPress = {() => this.click_item("child", index, 0)}>
                                        <View style = {styles.item_arrow_view}>
                                        {
                                            item.bads.expand.expand &&
                                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/up_arrow.png')}/>
                                        }
                                        {
                                            !item.bads.expand.expand &&
                                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/down_arrow.png')}/>
                                        }
                                        </View>
                                        <View style = {styles.item_text_view}>
                                            <Text style = {[styles.item_text, {color: '#0000ff'}]}>Negative Factors</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {
                                        item.bads.expand && (
                                            item.bads.map((sub_item, sub_index) => 
                                            <View key = {sub_index} style = {{width: '100%'}}>
                                                <View style = {{borderBottomColor: '#c0c0c0', borderBottomWidth: 1, paddingLeft: 50, paddingTop: 5, paddingBottom: 5}}>
                                                    {/* <View style = {styles.item_text_view}> */}
                                                    <View>
                                                        <Text style = {[styles.item_text, {color: '#ff0000'}]}>{sub_item.factorDesc}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            )
                                        )
                                            
                                    }
                                
                                    <TouchableOpacity style = {[styles.item_style, {paddingLeft: 10}]} onPress = {() => this.click_item("child", index, 1)}>
                                        <View style = {styles.item_arrow_view}>
                                        {
                                            item.goods.expand &&
                                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/up_arrow.png')}/>
                                        }
                                        {
                                            !item.goods.expand &&
                                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/down_arrow.png')}/>
                                        }
                                        </View>
                                        <View style = {styles.item_text_view}>
                                            <Text style = {[styles.item_text, {color: '#0000ff'}]}>Positive Factors</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {
                                        item.goods.expand && (
                                            item.goods.map((sub_item, sub_index) => 
                                            <View key = {sub_index} style = {{width: '100%'}}>
                                                <View style = {{borderBottomColor: '#c0c0c0', borderBottomWidth: 1, paddingLeft: 50, paddingTop: 5, paddingBottom: 5}}>
                                                    {/* <View style = {styles.item_text_view}> */}
                                                    <View>
                                                        <Text style = {[styles.item_text, {color: '#ff0000'}]}>{sub_item.factorDesc}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            )
                                        )
                                    }

                                    <TouchableOpacity style = {[styles.item_style, {paddingLeft: 10}]} onPress = {() => this.click_item("child", index, 2)}>
                                        <View style = {styles.item_arrow_view}>
                                        {
                                            item.warnings.expand &&
                                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/up_arrow.png')}/>
                                        }
                                        {
                                            !item.warnings.expand &&
                                            <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/down_arrow.png')}/>
                                        }
                                        </View>
                                        <View style = {styles.item_text_view}>
                                            <Text style = {[styles.item_text, {color: '#0000ff'}]}>Strict Precautions</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {
                                        item.warnings.expand && (
                                            item.warnings.map((sub_item, sub_index) => 
                                            <View key = {sub_index} style = {{width: '100%'}}>
                                                <View style = {{borderBottomColor: '#c0c0c0', borderBottomWidth: 1, paddingLeft: 50, paddingTop: 5, paddingBottom: 5}}>
                                                    {/* <View style = {styles.item_text_view}> */}
                                                    <View>
                                                        <Text style = {[styles.item_text, {color: '#ff0000'}]}>{sub_item.factorDesc}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            )
                                        )
                                    }
                                </View>
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
        height: 40,
        borderBottomColor: '#c0c0c0',
        borderBottomWidth: 1,
        alignItems: 'center',
        flexDirection: 'row'
    },
    item_arrow_view: {
        width: 40,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_text_view: {
        width: '70%',
        height: '100%',
        justifyContent: 'center'
    },
    item_text: {
        fontSize: 16,
        color: '#000000'
    }
})