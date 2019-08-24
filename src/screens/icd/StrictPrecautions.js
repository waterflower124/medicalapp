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
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global'
import { TextInput } from 'react-native-gesture-handler';

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

export default class StrictPrecaustions extends Component {
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

            note_list: [],
            create_precaution_modal_show: false,

            new_precaution_desc: ""

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
            
            note_list: Global.icd_admin_json.notes,

        });
    }

    select_tab = (item) => {
        this.hidden_right_menu();
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
        var note_list = this.state.note_list;
        for(i = 0; i < note_list.length; i ++) {
            if(i == index) {
                note_list[i].clicked = !note_list[i].clicked;
            } else {
                note_list[i].clicked = false;
            }
        }
        this.setState({
            note_list: note_list,
            right_menu_clicked: true
        });
    }

    hidden_right_menu = () => {
        var note_list = this.state.note_list;
        for(i = 0; i < note_list.length; i ++) {
            note_list[i].clicked = false;
        }
        this.setState({
            note_list: note_list,
            right_menu_clicked: false,
            selected_right_menu_index: -1
        });
    }

    show_alert() {
        this.setState({
            right_menu_clicked: false,
        });
        Alert.alert('Notice!', 'Do you really delete this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.delete_note(this.state.selected_right_menu_index)},
        ],
        { cancelable: true })
    }

    delete_note(index) {
        var note_list = this.state.note_list;
        note_list.splice(index, 1);
        this.setState({
            note_list: note_list
        });
        Global.icd_admin_json.notes = note_list;
    }

    add_new_precaution() {
        var item = {
           "noteDesc": this.state.new_precaution_desc 
        };
        var note_list = this.state.note_list;
        note_list.push(item);
        this.setState({
            note_list: note_list
        });
        Global.icd_admin_json.notes = note_list;
        this.setState({
            create_precaution_modal_show: false,
            new_precaution_desc: ''
        })
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
        {
            this.state.create_precaution_modal_show &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: 0.3, zIndex: 50}}>
            </View>
        }
        {
            this.state.create_precaution_modal_show &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                <View style = {{width: '80%', height: 230, alignItems: 'center', backgroundColor: '#ffffff'}}>
                    <View style = {{width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#445774'}}>
                        <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>Create Precaution</Text>
                    </View>
                    <View style = {{width: '100%', height: 30, justifyContent: 'center', marginLeft: 10}}>
                        <Text style = {styles.component_content_text}>Enter Precaution</Text>
                    </View>
                    <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, justifyContent: 'center'}}>
                        <TextInput style = {[styles.component_content_text, {padding: 0}]} onChangeText = {(text) => this.setState({new_precaution_desc: text})}>{this.state.new_precaution_desc}</TextInput>
                    </View>
                    <View style = {{width: '95%', height: 110, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                        <TouchableOpacity style = {{width: '45%', height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#445774'}} onPress = {() => this.setState({create_precaution_modal_show: false})}>
                            <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{width: '45%', height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#445774'}} onPress = {() => this.add_new_precaution()}>
                            <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>OK</Text>
                        </TouchableOpacity>
                    </View>
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
                    <Text style = {{fontSize: 18, color: '#ffffff'}} numberOfLines = {1} renderTruncatedFooter = {() => null}>Strict Precaustions</Text>
                </View>
                <View style = {{width: '20%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{paddingBottom: 150}}>
                    {
                        this.state.note_list.map((item, index) => 
                        <View key = {index} style = {{width: '100%', flexDirection: 'row', marginTop: 20, zIndex: 1000-index}} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout, index)}}>
                            <View style = {{width: '90%'}}>
                                <Text style = {styles.component_content_text} multiline = {true}>{item.noteDesc}</Text>
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
                <TouchableOpacity style = {styles.add_button} onPress = {() => this.setState({create_precaution_modal_show: true})}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source={require('../../assets/images/new_case_add.png')}/>
                </TouchableOpacity>
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
                        <Text style = {styles.tab_item_text} numberOfLines = {1} renderTruncatedFooter = {() => null}>Differential Diagnosis</Text>
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