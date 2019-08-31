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
    TouchableWithoutFeedback,
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global'
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
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - tab_view_height : safearea_height - menu_bar_height - tab_view_height - StatusBar.currentHeight;

var item_y_pos_array = [];

export default class EditDiagnosis extends Component {
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

            diagnoses_list: [],
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
        this.setState({
            edit_case_json: Global.edit_case_json,
            visitStatus: Global.visitStatus,
            page_title: Global.editcase_page_title,
        });

        if(Global.edit_case_json.diagnoses != null) {
            this.setState({
                diagnoses_list: Global.edit_case_json.diagnoses,
            })
        }
    }

    select_tab = (item) => {
        this.hidden_right_menu();
        Global.editcase_page_title = item;
        if(item == "Visit Master") {
            this.props.navigation.navigate("VisitMaster");
        } else if(item == "Symptoms") {
            this.props.navigation.navigate("Symptoms");
        } else if(item == "Diagnosis") {
            this.props.navigation.navigate("EditDiagnosis");
        } else if(item == "Prescription") {
            this.props.navigation.navigate("Prescription");
        } else if(item == "Lab tests") {
            this.props.navigation.navigate("LabTests");
        } else if(item == "Procedure") {
            this.props.navigation.navigate("Procedure");
        } else if(item == "Referal") {
            this.props.navigation.navigate("Referal");
        }
    }

    go_back() {
        Alert.alert('Notice!', 'Any changes will be lost, do you want to abort?',
        [
            {text: 'No', onPress: null},
            {text: 'Yes', onPress: () => {
                Global.editcase_page_title = "Visit Master";
                Global.procedure_selected_top_tab = "Procedure";
                this.props.navigation.navigate("PendingVisit");
            }},
        ],
        { cancelable: true })
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
            height: 150,
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
        var diagnoses_list = this.state.diagnoses_list;
        for(i = 0; i < diagnoses_list.length; i ++) {
            if(i == index) {
                diagnoses_list[i].clicked = !diagnoses_list[i].clicked;
            } else {
                diagnoses_list[i].clicked = false;
            }
        }
        this.setState({
            diagnoses_list: diagnoses_list,
            right_menu_clicked: true
        });
    }

    hidden_right_menu = () => {
        var diagnoses_list = this.state.diagnoses_list;
        for(i = 0; i < diagnoses_list.length; i ++) {
            diagnoses_list[i].clicked = false;
        }
        this.setState({
            diagnoses_list: diagnoses_list,
            right_menu_clicked: false
        });
    }

    show_alert() {
        this.hidden_right_menu();
        Alert.alert('Notice!', 'Do you really delete this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.delete_symptom(this.state.selected_right_menu_index)},
        ],
        { cancelable: true })
    }

    delete_symptom(index) {
        var diagnoses_list = this.state.diagnoses_list;
        diagnoses_list.splice(index, 1);
        this.setState({
            diagnoses_list: diagnoses_list
        });
        Global.edit_case_json.diagnoses = diagnoses_list;
    }

    mark_as_wrong = async() => {
        this.hidden_right_menu();
        if(Global.edit_case_json.diagnoses[this.state.selected_right_menu_index].wrong == "Y") {
            Global.edit_case_json.diagnoses[this.state.selected_right_menu_index].wrong = "";
        } else {
            Global.edit_case_json.diagnoses[this.state.selected_right_menu_index].wrong = "Y";
        }
        Global.edit_case_json.diagnoses[this.state.selected_right_menu_index].clicked = false;
        this.setState({
            diagnoses_list: Global.edit_case_json.diagnoses
        });
    }

    open_link = async() => {
        this.hidden_right_menu();
        var google_link = "https://www.google.com/?q=" + this.state.diagnoses_list[this.state.selected_right_menu_index].diagnoseDesc;
        Linking.canOpenURL(google_link).then(supported => {
            if (supported) {
                Linking.openURL(google_link);
            } else {
                // console.warn("can't open");
            }
        });
    }

    save_case = async() => {
        if(Global.edit_case_json.visitDate == "" || Global.edit_case_json.visitDate == null || 
            Global.edit_case_json.hospitalName == "" || Global.edit_case_json.hospitalName == null 
            || Global.edit_case_json.doctorName == "" || Global.edit_case_json.doctorName == null) {
            Alert.alert("Warning!", "You have to input Visit Date, Hospital Name and Doctor Name.");
            return;
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/visitproxy', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(Global.edit_case_json)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            Global.editcase_page_title = "Visit Master";
            Global.procedure_selected_top_tab = "Procedure";
            this.props.navigation.navigate("PendingVisit");
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
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
                <View style = {{width: '40%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>{this.state.page_title}</Text>
                </View>
                <View style = {{width: '40%', height: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.go_back()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/cancel_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{paddingBottom: 150}}>
                    {
                        this.state.diagnoses_list.map((item, index) => 
                        <View key = {index} style = {{width: '100%', flexDirection: 'row', marginTop: 20, zIndex: 1000-index}} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout)}}>
                            <View style = {{width: '80%'}}>
                                <Text style = {styles.component_content_text} multiline = {true}>{item.diagnoseDesc}</Text>
                            </View>
                            <View style = {{width: '10%', alignItems: 'center'}}>
                            {
                                item.wrong == "Y" &&
                                <View style = {{width: 25, height: 25, borderRadius: 25, backgroundColor: '#ea495f', justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style = {[styles.component_content_text, {fontSize: 14, color: '#ffffff'}]}>W</Text>
                                </View>
                            }
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
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.mark_as_wrong()}>
                                <Text style = {styles.right_menu_text}>{this.state.diagnoses_list[this.state.selected_right_menu_index].wrong == "Y" ? "Mark As True" : "Mark As Wrong"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {styles.right_menu_item} onPress = {() => this.open_link()}>
                                <Text style = {styles.right_menu_text}>About</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    </View>
                </ScrollView>
                <TouchableOpacity style = {styles.add_button} onPress = {() => this.props.navigation.navigate("SelectDiagnosis", {prev_screen: "EditDiagnosis"})}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source={require('../../assets/images/new_case_add.png')}/>
                </TouchableOpacity>
            </View>
            <View style = {styles.tab_view}>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Visit Master" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Visit Master")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Visit Master" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_master.png')}/>
                    </View>
                {
                    this.state.page_title == "Visit Master" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Master</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Symptoms" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Symptoms")}>
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
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Diagnosis" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Diagnosis")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Diagnosis" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_diagnosis.png')}/>
                    </View>
                {
                    this.state.page_title == "Diagnosis" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Diagnosis</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Prescription" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Prescription")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Prescription" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_prescription.png')}/>
                    </View>
                {
                    this.state.page_title == "Prescription" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Prescription</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Lab tests" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Lab tests")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Lab tests" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_laboratory.png')}/>
                    </View>
                {
                    this.state.page_title == "Lab tests" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Lab tests</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Procedure" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Procedure")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Procedure" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_procedure.png')}/>
                    </View>
                {
                    this.state.page_title == "Procedure" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Procedure</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Referal" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Referal")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Referal" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_referal.png')}/>
                    </View>
                {
                    this.state.page_title == "Referal" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Referal</Text>
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
        backgroundColor: '#8469ad'
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
        height: 150,
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