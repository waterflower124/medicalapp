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
import Global from '../../utils/Global/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import RadioForm from '../../utils/component/radiobutton/SimpleRadioButton'

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var tab_view_height = 50;
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - tab_view_height : safearea_height - menu_bar_height - tab_view_height - StatusBar.currentHeight;

var radio_props = [
    {label: 'Yes', value: 'Y' },
    {label: 'No', value: 'N' }
];

var item_y_pos_array = [];

export default class CptPostOP extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            cpt_admin_json: null,
            page_title: '',

            instructions_list: [],
            right_menu_clicked: false,
            selected_right_menu_index: -1,

		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_visit.bind(this));
    }

    init_visit = () => {
        this.setState({
            cpt_admin_json: Global.cpt_admin_json,
            page_title: Global.cpt_admin_page_title,

            instructions_list: Global.cpt_admin_json.surgeryInst,

        });
    }

    select_tab = (item) => {
        Global.cpt_admin_page_title = item;
        if(item == "CptMaster") {
            this.props.navigation.navigate("CptMaster");
        } else if(item == "CptRisks") {
            this.props.navigation.navigate("CptRisks");
        } else if(item == "CptAlternatives") {
            this.props.navigation.navigate("CptAlternatives");
        } else if(item == "CptPostOP") {
            this.props.navigation.navigate("CptPostOP");
        } 
    }

    go_back() {
        Global.cpt_admin_page_title = "CptMaster";
        this.props.navigation.navigate("Home");
    }

    onLayoutEvent(layout, index) {
        const {x, y, width, height} = layout;
        item_y_pos_array.splice(index, 0, height);
       
    }

    right_menu_view_style = function () {
        var top_pos = 20;
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
            zIndex: 1000
        }
    }

    select_right_menu = (index) => {
        this.setState({
            selected_right_menu_index: index
        })
        var instructions_list = this.state.instructions_list;
        for(i = 0; i < instructions_list.length; i ++) {
            if(i == index) {
                instructions_list[i].clicked = !instructions_list[i].clicked;
            } else {
                instructions_list[i].clicked = false;
            }
        }
        this.setState({
            instructions_list: instructions_list,
            right_menu_clicked: true
        });
    }

    hidden_right_menu = () => {
        var instructions_list = this.state.instructions_list;
        for(i = 0; i < instructions_list.length; i ++) {
            instructions_list[i].clicked = false;
        }
        this.setState({
            instructions_list: instructions_list,
            right_menu_clicked: false,
            selected_right_menu_index: -1
        });
    }

    show_alert() {
        var instructions_list = this.state.instructions_list;
        for(i = 0; i < instructions_list.length; i ++) {
            instructions_list[i].clicked = false;
        }
        this.setState({
            instructions_list: instructions_list,
            right_menu_clicked: false,
        });
        Alert.alert('Notice!', 'Do you really delete this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.delete_postop(this.state.selected_right_menu_index)},
        ],
        { cancelable: true })
    }

    delete_postop(index) {
        var instructions_list = this.state.instructions_list;
        instructions_list.splice(index, 1);
        this.setState({
            instructions_list: instructions_list
        })
        Global.cpt_admin_json.surgeryInst = instructions_list;
    }

    save_case = async() => {
        if(Global.cpt_admin_json.medproc.procDesc == "") {
            Alert.alert("Warning!", "Please select procedure.");
            return;
        }

        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/surgeryproxy', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(Global.cpt_admin_json)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            Alert.alert('Success!', "Successfully Saved.");
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
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
                    <TouchableOpacity onPress = {() => this.go_back()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Post-op Instructions</Text>
                </View>
                <View style = {{width: '20%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{paddingBottom: 150}}>
                    {
                        this.state.instructions_list.map((item, index) => 
                        <View key = {index} style = {{width: '100%', flexDirection: 'row', marginTop: 20, zIndex: 1000-index}} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout, index)}}>
                            <View style = {{width: '90%'}}>
                                <Text style = {styles.component_content_text} multiline = {true}>{item.instructionDesc}</Text>
                            </View>
                            <View style = {{width: '10%', alignItems: 'flex-end', marginRight: 10}}>
                                <TouchableOpacity onPress = {() => this.select_right_menu(index)}>
                                    <Image style = {{width: 30, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/pending_lab_menu_right.png')}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        )
                    }
                    {
                        this.state.right_menu_clicked &&
                        <View style = {this.right_menu_view_style()}>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.show_alert()}>
                                <Text style = {styles.right_menu_text}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    </View>
                </ScrollView>
                <TouchableOpacity style = {styles.add_button} onPress = {() => this.props.navigation.navigate("SelectInstruction", {prev_screen: "CptPostOP"})}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source={require('../../assets/images/new_case_add.png')}/>
                </TouchableOpacity>
            </View>
            <View style = {styles.tab_view}>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "CptMaster" ? {width: "30%"} : null]} onPress = {() => this.select_tab("CptMaster")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "CptMaster" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_master.png')}/>
                    </View>
                {
                    this.state.page_title == "CptMaster" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Cpt Master</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "CptRisks" ? {width: "30%"} : null]} onPress = {() => this.select_tab("CptRisks")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "CptRisks" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_diagnosis.png')}/>
                    </View>
                {
                    this.state.page_title == "CptRisks" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Risks</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "CptAlternatives" ? {width: "30%"} : null]} onPress = {() => this.select_tab("CptAlternatives")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "CptAlternatives" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_laboratory.png')}/>
                    </View>
                {
                    this.state.page_title == "CptAlternatives" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Alternatives</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "CptPostOP" ? {width: "30%"} : null]} onPress = {() => this.select_tab("CptPostOP")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "CptPostOP" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_symptoms.png')}/>
                    </View>
                {
                    this.state.page_title == "CptPostOP" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Post-op Instructions</Text>
                    </View>
                }
                </TouchableOpacity>
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
        backgroundColor: '#00b5c7'
    },
    tab_item_view: {
        width: '23%',
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
        height: 100,
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