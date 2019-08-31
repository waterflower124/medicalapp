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

export default class CptMaster extends Component {
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

            procedure_name: "",
            cpt_code: "",
            consumer_name: "",
            success_rate: "",
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

            procedure_name: Global.cpt_admin_json.medproc.procDesc,
            cpt_code: Global.cpt_admin_json.medproc.procCode,
            consumer_name: Global.cpt_admin_json.medproc.procAlias,
            success_rate: Global.cpt_admin_json.medproc.successRate,
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

    select_procedure() {
        this.props.navigation.navigate("SelectProcedureName", {prev_screen: "CptMaster"});
    }
    
    set_consumer_name(text) {
        this.setState({
            consumer_name: text
        })
        Global.cpt_admin_json.medproc.procAlias = text;
    }

    save_case = async() => {
        // console.warn(Global.cpt_admin_json);
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
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>CPT Admin</Text>
                </View>
                <View style = {{width: '20%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <KeyboardAwareScrollView style = {{width: '90%'}}>
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.select_procedure()}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Procedure Name</Text>
                        </View>
                        <View style = {[styles.component_content_view, {flexDirection: 'row'}]}>
                            <View style = {{width: '90%', height: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Procedure Name"}>{this.state.procedure_name}</TextInput>
                            </View>
                            <View style = {{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Cpt Code</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Cpt Code"}>{this.state.cpt_code}</TextInput>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Consumer Name</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} placeholder = {"Consumer Name"} onChangeText = {(text) => this.set_consumer_name(text)}>{this.state.consumer_name}</TextInput>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Success Rate %</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Misdiagnosed %"}>{this.state.success_rate.toString()}</TextInput>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
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


    component_view: {
        width: '100%',
        marginTop: 10
    },
    component_title_view: {
        width: '100%'
    },
    component_title_text: {
        fontSize: 12,
        color: '#808080'
    },
    component_content_view: {
        width: '100%',
        // height: 30,
        borderBottomColor: '#de9d73',
        borderBottomWidth: 1,
        justifyContent: 'flex-end',
        marginTop: 5
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    },
    
})