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
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var tab_view_height = 50;
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

var item_y_pos_array = [];

export default class MyPatient extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            edit_case_json: null,
            visitStatus: '',
            page_title: '',

            patient_list: props.navigation.state.params.patient_list,
            right_menu_clicked: false,
            selected_right_menu_index: -1

		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_visit.bind(this));
    }

    init_visit = () => {
        
    }

    go_back() {
        this.props.navigation.navigate("AdvocateHome");
    }

    onLayoutEvent(layout) {
        const {x, y, width, height} = layout;
        item_y_pos_array.push(height);
    }

    right_menu_view_style = function() {
        var top_pos = 40;
        for(i = 0; i < this.state.selected_right_menu_index; i ++) {
            top_pos += item_y_pos_array[i] + 20;
        }

        return {
            width: 150,
            height: 50,
            position: 'absolute',
            top: top_pos,
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
        var patient_list = this.state.patient_list;
        for(i = 0; i < patient_list.length; i ++) {
            if(i == index) {
                patient_list[i].clicked = !patient_list[i].clicked;
            } else {
                patient_list[i].clicked = false;
            }
        }
        this.setState({
            patient_list: patient_list,
            right_menu_clicked: true
        });
    }

    hidden_right_menu = () => {
        var patient_list = this.state.patient_list;
        for(i = 0; i < patient_list.length; i ++) {
            patient_list[i].clicked = false;
        }
        this.setState({
            patient_list: patient_list,
            right_menu_clicked: false
        });
    }

    patient_profile() {
        var item = this.state.patient_list[this.state.selected_right_menu_index];
        Global.profile_user_name = item.userName;
        Global.userCode = item.userCode;
        Global.mother = item.mother;
        Global.advocate_userid = item.father;

        Global.father = item.father;
        Global.email = item.email;
        Global.paarea = item.paarea;
        Global.padesc = item.padesc;
        Global.paname = item.paname;
        Global.phone = item.phone;
        Global.paorg = item.paorg;
        this.props.navigation.navigate("Home");
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
                    <TouchableOpacity onPress = {() => this.go_back()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>My Patient</Text>
                </View>
                
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{paddingBottom: 150}}>
                    {
                        this.state.patient_list.map((item, index) => 
                        <View key = {index} style = {{width: '100%', flexDirection: 'row', marginTop: 20, zIndex: 1000-index}} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout)}}>
                            <View style = {{width: '90%'}}>
                                <Text style = {styles.component_content_text} multiline = {true}>{item.userName}</Text>
                            </View>
                            <View style = {{width: '10%', alignItems: 'flex-end', marginRight: 10}}>
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
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.patient_profile()}>
                                <Text style = {styles.right_menu_text}>Patient Profile</Text>
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
    tab_view: {
        width: '100%',
        height: tab_view_height,
        flexDirection: 'row',
        backgroundColor: '#00aea3'
    },
    tab_item_view: {
        width: '13%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab_item_icon_view: {
        width: '100%',
        height: '60%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab_item_text_view: {
        width: '100%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab_item_text: {
        fontSize: 12,
        color: '#ffffff'
    },


    component_content_text: {
        fontSize: 16,
        color: '#000000'
    },
    right_menu_view: {
        width: 150,
        height: 50,
        position: 'absolute',
        top: 20,
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
        marginLeft: 10
    },
    right_menu_text: {
        fontSize: 14,
        color: '#000000'
    },

    add_button: {
        width: 40,
        height: 40,
        position: 'absolute',
        right: 20,
        bottom: 20,
        borderRadius: 40
    },
    
})