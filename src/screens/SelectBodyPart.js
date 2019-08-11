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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 50;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class SelectBodyPart extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            bodypart_list: props.navigation.state.params.bodypart_list,
            global_bodypart_list: props.navigation.state.params.bodypart_list,
            
		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    backto_newcase(item) {
        this.props.navigation.navigate("NewCase");
        this.props.navigation.state.params.set_body_part({selected_body_part: item});
    }

    search_body_part = (text) => {
        var global_bodypart_list = this.state.global_bodypart_list;
        var bodypart_list = [];
        for(i = 0; i < global_bodypart_list.length; i ++) {
            if(global_bodypart_list[i].partName.indexOf(text) > -1) {
                bodypart_list.push(global_bodypart_list[i]);
            }
        }
        this.setState({
            bodypart_list: bodypart_list
        })
    }

    render() {
        return (
        <SafeAreaView style = {styles.container}>
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("NewCase")}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Select Body Part/Organ</Text>
                </View>

            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, flexDirection: 'row', marginTop: 10}}>
                    <View style = {{width: '80%', height: '100%'}}>
                        <TextInput style = {styles.search_input_text} placeholder = {'Search Body Part/Organ'} onChangeText = {(text) => this.search_body_part(text)}></TextInput>
                    </View>
                    <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                        <Image style = {{width: 20, height: 20, marginRight: 10}} resizeMode = {'contain'} source={require('../assets/images/search_icon.png')}/>
                    </View>
                </View>
                <View style = {{width: '95%', height: main_view_height - 40 - 10}}>
                    <ScrollView style = {{width: '100%'}}>
                    {
                        this.state.bodypart_list.map((item, index) => 
                        <TouchableOpacity key = {index} style = {styles.component_view} onPress = {() => this.backto_newcase(item)}>
                            <Text style = {styles.component_content_text}>{item.partName}</Text>
                        </TouchableOpacity>
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
    component_view: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        paddingLeft: 10
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    }
})