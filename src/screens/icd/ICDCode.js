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

export default class VisitMaster extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            icd_admin_json: null,
            page_title: '',

            diagnoseDesc: '',
            diagnoseCode: "",
            diagnoseIcd9: "",
            diagnoseAlias: "",
            errorMargin: 0,
            hereditary: "",
            comments: "",


		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_visit.bind(this));
    }

    init_visit = () => {
        this.setState({
            icd_admin_json: Global.icd_admin_json,
            page_title: Global.icd_admin_page_title,

            diagnoseDesc: Global.icd_admin_json.diagnoseDesc,
            diagnoseCode: Global.icd_admin_json.diagnoseCode,
            diagnoseIcd9: Global.icd_admin_json.diagnoseIcd9,
            diagnoseAlias: Global.icd_admin_json.diagnoseAlias,
            errorMargin: Global.icd_admin_json.errorMargin,
            hereditary: Global.icd_admin_json.hereditary,

        });
    }

    select_tab = (item) => {
        Global.icd_admin_page_title = item;
        if(item == "Icd Master") {
            this.props.navigation.navigate("ICDCode");
        } else if(item == "Differential Diagnosis") {
            this.props.navigation.navigate("DifferentialDiagnosis");
        } else if(item == "Required Labs") {
            this.props.navigation.navigate("RequiredLabs");
        } else if(item == "Symptoms") {
            this.props.navigation.navigate("IcdSymptoms");
        } else if(item == "Strict Precautions") {
            this.props.navigation.navigate("StrictPrecautions");
        } 
    }

    go_back() {
        Global.icd_admin_page_title = "Icd Master";
        this.props.navigation.navigate("Home");
    }

    select_diagnosis() {
        this.props.navigation.navigate("SelectDiagnosis", {prev_screen: "ICDCode"});
    }

    set_diagnoseIcd9(text) {
        this.setState({
            diagnoseIcd9: text
        })
        Global.icd_admin_json.diagnoseIcd9 = text;
    }

    set_symonyms(text) {
        this.setState({
            diagnoseAlias: text
        })
        Global.icd_admin_json.diagnoseAlias = text;
    }

    save_case = async() => {
        if(Global.icd_admin_json.diagnoseCode == "") {
            Alert.alert("Warning!", "Please select diagnose.");
            return;
        }

        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/admin', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(Global.icd_admin_json)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            if(data.message == "Success") {
                Alert.alert('Success!', "Successfully Saved.");
            } else {
                Alert.alert('Fail!', "Failed Save.");
            }
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
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>ICD Code</Text>
                </View>
                <View style = {{width: '20%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <KeyboardAwareScrollView style = {{width: '90%'}}>
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.select_diagnosis()}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Select Diagnose ICD10</Text>
                        </View>
                        <View style = {[styles.component_content_view, {flexDirection: 'row'}]}>
                            <View style = {{width: '90%', height: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Select Diagnose ICD10"}>{this.state.diagnoseCode}</TextInput>
                            </View>
                            <View style = {{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Diagnose Desc</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Diagnose Desc"}>{this.state.diagnoseDesc}</TextInput>
                            </View>
                        </View>
                    </View>
                    <View style = {[styles.component_view, {borderBottomColor: '#de9d73', borderBottomWidth: 1,}]}>
                        <View style = {{width: '100%', height: 30, flexDirection: 'row'}}>
                            <View style = {{width: '50%', height: '100%', justifyContent: 'center'}}>
                                <Text style = {[styles.component_title_text, {fontSize: 14}]}>Hereditary?</Text>
                            </View>
                            <View style = {{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                            {
                                this.state.hereditary == "Y" &&
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={0}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonSize={15}
                                    buttonColor={'#ff954c'}
                                    selectedButtonColor = {'#ff954c'}
                                    labelStyle = {{fontSize: 14, color: '#000000', marginRight: 5}}
                                    animation={true}
                                    onPress={(value) => {Global.icd_admin_json.hereditary = value}}
                                />
                            }
                            {
                                this.state.hereditary != "Y" &&
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={1}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonSize={15}
                                    buttonColor={'#ff954c'}
                                    selectedButtonColor = {'#ff954c'}
                                    labelStyle = {{fontSize: 14, color: '#000000', marginRight: 5}}
                                    animation={true}
                                    onPress={(value) => {Global.icd_admin_json.hereditary = value}}
                                />
                            }  
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Misdiagnosed %</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Misdiagnosed %"}>{this.state.errorMargin.toString()}</TextInput>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Icd 9 Code</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} placeholder = {"Icd 9 Code"} onChangeText = {(text) => this.set_diagnoseIcd9(text)}>{this.state.diagnoseIcd9}</TextInput>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Symonyms</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} multiline = {true} placeholder = {'Symonyms'} onChangeText = {(text) => this.set_symonyms(text)}>{this.state.diagnoseAlias}</TextInput>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
            <View style = {styles.tab_view}>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Icd Master" ? {width: "28%"} : null]} onPress = {() => this.select_tab("Icd Master")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Icd Master" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_master.png')}/>
                    </View>
                {
                    this.state.page_title == "Icd Master" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Icd Master</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Differential Diagnosis" ? {width: "28%"} : null]} onPress = {() => this.select_tab("Differential Diagnosis")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Differential Diagnosis" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_diagnosis.png')}/>
                    </View>
                {
                    this.state.page_title == "Differential Diagnosis" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Differential Diagnosis</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Required Labs" ? {width: "28%"} : null]} onPress = {() => this.select_tab("Required Labs")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Required Labs" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_laboratory.png')}/>
                    </View>
                {
                    this.state.page_title == "Required Labs" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Required Labs</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Symptoms" ? {width: "28%"} : null]} onPress = {() => this.select_tab("Symptoms")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Symptoms" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_symptoms.png')}/>
                    </View>
                {
                    this.state.page_title == "Symptoms" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Symptoms</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Strict Precautions" ? {width: "28%"} : null]} onPress = {() => this.select_tab("Strict Precautions")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Strict Precautions" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_laboratory.png')}/>
                    </View>
                {
                    this.state.page_title == "Strict Precautions" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Strict Precautions</Text>
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
        width: '18%',
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