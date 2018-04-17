import React, { Component } from 'react';
import {
    Badge, Row, Col, Card, Dropdown, Form, DropdownToggle, FormInput,
    InputGroup, Input, FormGroup, Label, CardHeader, CardBody, Container,
    Table, Pagination, DropdownMenu, PaginationItem, PaginationLink, InputGroupAddon, InputGroupText, Button
} from 'reactstrap';
import Select from 'react-select';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import SessionForm from '../Sessions/SessionForm';
import { ToastContainer, toast } from 'react-toastify';
//let InvalidMessage = [];
let ShareInput = [];
class QuestionsForm extends Component {
    constructor(props) {
        super(props);
        console.log(props, "popssssss");
        this.InvalidMessage = "";
        this.state = {
            Forms: [],  //stores all available forms
            FormID: [],   //form name( doc name in firestore)
            //formValueId: props.sessionId,     //Id of the current form 
            //formValue : props.sessionName, // name of the current form 
            CurrentForm: [],    //Current form questions data
            QueAns: [],///Question and Answer data after  filling form
            OptionalCurrentArray: []
        }
        this.onFormSelectValue = this.onFormSelectValue.bind(this);  //start rendering questions 
        this.RenderAnswerField = this.RenderAnswerField.bind(this);  //start rendering answer 
        this.onMultiChoice = this.onMultiChoice.bind(this);   //If input field is multiple choice (rendering multiple choice)
        this.onCheckBox = this.onCheckBox.bind(this);  //If input field is Check Box (rendering  Check Box)
        this.onChangeQuestionTitle = this.onChangeQuestionTitle.bind(this);    //on change of the input fields
        this.onSubmit = this.onSubmit.bind(this);     //On submit of form
        this.onChangeInputField = this.onChangeInputField.bind(this);    //On changing the input field type for particular que 
        this.onAdditionofFeilds = this.onAdditionofFeilds.bind(this);   //On addition of input field
        this.onAddQuestion = this.onAddQuestion.bind(this);  //on adding new question to the form
        this.onDeleteQuestion = this.onDeleteQuestion.bind(this);    //on deleting the question from form
        this.onReset = this.onReset.bind(this);       //On reset whole form gets reset clearing all questions
    }

    
    componentWillMount() {
        let componentRef = this;
        DBUtil.addChangeListener("QuestionsForm", function (objectList) {
            let form = [];
            let FormID = [];
            let CurrentForm = [];
            objectList.forEach(function (doc) {
                FormID.push({ label: doc.id, value: doc.id });
                form.push({
                    FormID: doc.id,
                    FormData: doc.data()
                });
            });
            componentRef.setState({ Forms: form, FormID: FormID })
            componentRef.state.Forms.forEach(fItem => {
                if (fItem.FormID == componentRef.state.formValueId) {
                    CurrentForm = fItem.FormData.Questions;
                }
            });
            componentRef.setState({ CurrentForm: CurrentForm, OptionalCurrentArray: CurrentForm })
        });
    }

    onFormSelectValue(CurrentForm) {
        ShareInput = this.state.CurrentForm.map(Fitem => {
            return (
                <div>
                    <Row>
                        <Col xs="12" md="12">
                            <p className="text-muted"><h5>Question No: {Fitem.QueId}</h5></p>
                        </Col>
                    </Row>
                    <FormGroup row>

                        <Col xs="12" md="8">
                            <InputGroup className="mb-3" >
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <i className="icon-question"></i>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input type="text" id={Fitem.QueId} defaultValue={Fitem.QuestionTitle} onChange={this.onChangeQuestionTitle} />
                            </InputGroup>
                            {this.RenderAnswerField(Fitem)}
                        </Col>
                        <Col md="4">
                            <FormGroup row>
                                <h5> <Badge color="danger" onClick={(event) => this.onDeleteQuestion(event, Fitem)} pill>Delete Question no {Fitem.QueId} </Badge></h5>
                            </FormGroup >
                            <FormGroup row>
                                <Col md="6">
                                    <InputGroup className="mb-3">
                                        <Input type="select" style={{ width: 200 }} name="InputField" id={Fitem.QueId} placeholder="Feilds" onChange={(event) => this.onChangeInputField(event, Fitem.QueId)} >
                                            <option value=" ">--Select--</option>
                                            <option value="Input Text">Input Text</option>
                                            <option value="Mulitple Choice">Mulitple Choice</option>
                                            <option value="Check Box">Check Box</option>
                                        </Input>
                                    </InputGroup>
                                </Col>
                            </FormGroup >
                        </Col>
                    </FormGroup>
                </div>
            )
        });
        return ShareInput;
    }


    RenderAnswerField(item) {
        if (item.AnswerFeild == "Input Text") {
            return (
                <div>
                    <FormGroup row>
                        <Col xs="12" md="8" >
                            <InputGroup className="mb-3" >
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <i className="icon-note"></i>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input type="text" placeholder="Answer Title" name="Answer" id={item.QueId} onChange={this.onChange} />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                </div>
            )

        } else if (item.AnswerFeild == "Mulitple Choice") {
            return (
                <div>
                    <FormGroup row>
                        <Col  >
                            {this.onMultiChoice(item.value, item.QueId)}
                        </Col>
                    </FormGroup>
                </div>
            )
        }
        else if (item.AnswerFeild == "Check Box") {
            return (
                <div>
                    <FormGroup row>
                        <Col md="12" xs="12" >
                            {this.onCheckBox(item.value, item.QueId)}
                        </Col>
                    </FormGroup>
                </div>
            )
        }
        return (
            <div />
        )
    }

    onMultiChoice(value, id) {
        let MultiChoice = value.map(fItem => {
            return (
                <FormGroup check inline>
                    <Input className="form-check-input" id={id} type="radio" name="inline-radios" value={fItem.Value} />
                    <Input id={id} type="text" defaultValue={fItem.Value} name={fItem.fieldName} onChange={(event) => this.onAdditionofFeilds(event, id)} />
                    {/* <Label className="form-check-label" id={id} check htmlFor="inline-radio1">{fItem.Value}</Label> */}
                </FormGroup>
            )
        })
        if (MultiChoice.length == 0) {
            MultiChoice: return (
                <div>
                    <FormGroup row>
                        <Col xs="12">
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option1" />
                                <Input type="text" placeholder="Add Choice" id={id} name="0" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option2" />
                                <Input type="text" placeholder="Add Choice" id={id} name="1" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="2" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="3" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="4" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="5" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="6" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="7" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="8" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="9" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Input className="form-check-input" type="radio" id={id} name="inline-radios" value="option3" />
                                <Input type="text" placeholder="Add Choice" id={id} name="10" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                        </Col>
                    </FormGroup>
                </div>
            )
        }
        return MultiChoice;

    }


    onCheckBox(value, id) {
        let CheckBox = value.map(fItem => {
            return (
                <FormGroup check inline>
                    <Label >
                        <Input type="checkbox" id={id} />
                        <Input id={id} type="text" defaultValue={fItem.Value} name={fItem.fieldName} onChange={(event) => this.onAdditionofFeilds(event, id)} />
                    </Label>
                </FormGroup>

            )
        })
        if (CheckBox.length == 0) {
            CheckBox: return (
                <div>  <div>
                    <FormGroup row>
                        <Col xs="12">
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="0" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="1" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="2" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="3" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="4" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="5" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="6" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="7" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="8" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="9" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" id={id} />
                                </Label>
                                <Input type="text" placeholder="Add value" id={id} name="10" onChange={(event) => this.onAdditionofFeilds(event, id)} />
                            </FormGroup>

                        </Col>
                    </FormGroup>
                </div></div>
            );
        }
        return CheckBox;
    }
    onChangeInputField(event, id) {
        let tempArray = this.state.CurrentForm;
        tempArray[id].AnswerFeild = event.target.value;
        tempArray[id].value = [];
        this.setState({ CurrentForm: tempArray, OptionalCurrentArray: tempArray });
        //  console.log('id', this.state.CurrentForm);
    }
    onAdditionofFeilds(event, id) {
        let fieldName = parseInt(event.target.name);
        let fieldId = parseInt(event.target.id);
        let OptionalCurrentArray = this.state.CurrentForm;
        OptionalCurrentArray[fieldId].value[fieldName] = ({ fieldName: fieldName, Value: event.target.value });
        //console.log('opt', OptionalCurrentArray);
        this.state.OptionalCurrentArray = OptionalCurrentArray;
        // this.setState({
        //   OptionalCurrentArray : OptionalCurrentArray
        // })
    }
    onAddQuestion() {
        let tempArray = this.state.OptionalCurrentArray;
        if (tempArray.length == 0) {
            tempArray.push({ QueId: 0, QuestionTitle: '', AnswerFeild: '', value: [] })
        }
        else {
            tempArray.push({ QueId: tempArray.length, QuestionTitle: '', AnswerFeild: '', value: [] })
        }
        this.state.OptionalCurrentArray = tempArray;
        this.setState({ CurrentForm: tempArray })
    }
    onChangeQuestionTitle(event) {
        let tempArray = this.state.OptionalCurrentArray;
        tempArray[event.target.id].QuestionTitle = event.target.value;
        this.state.OptionalCurrentArray = tempArray;
        // console.log('Event details',this.state.OptionalCurrentArray);

    }
    onDeleteQuestion(event, Que) {
        const id = Que.QueId;
        let NewState = this.state.OptionalCurrentArray;
        NewState.splice(id, 1);
        for (var i = 0; i < NewState.length; i++) {  //adjusting index and QueID 
            if (NewState[i].QueId != i) {
                NewState[i].QueId = i;
            }
        }
        this.setState({ CurrentForm: NewState, OptionalCurrentArray: NewState });
    }
    onReset() {
        this.setState({
            CurrentForm: []
        })
    }
    HandleValidations() {
        let HandleBlankFields = false;
        this.state.OptionalCurrentArray.forEach(fItem => {
            if (fItem.QuestionTitle == "" || fItem.QuestionTitle == null) {
                HandleBlankFields = true;
            }
            if (fItem.AnswerFeild == "Mulitple Choice" || fItem.AnswerFeild == "Check Box") {
                for (var i = 0; i < fItem.value.length; i++) {
                    if (fItem.value[i] == "" || fItem.value[i] == null) {
                        HandleBlankFields = true;
                    }
                }
            }
        })
        this.setState({
            HandleBlankFields: HandleBlankFields
        })
        return HandleBlankFields;
    }
    onSubmit(evt) {
        this.state.OptionalCurrentArray.forEach(fItem => {
            fItem.value.sort();
            var j = 0;
            for (var i = 0; i < fItem.value.length; i++) { //ADJUSTING THE INDEX OF VALUES ENTERED FOR MULTI CHOICE OR CHECK BOX
                if (fItem.value[i] == undefined) {
                    j++;
                }
            }
            fItem.value.length = fItem.value.length - j;
        })
        //   this.HandleValidations();

        let invalid = this.HandleValidations();
        // if (this.state.formValue && invalid == false) {
            let componentRef = this;
            let tableName = "QuestionsForm";
            let docName = "feedbackForm";
            let doc = {
                Questions: this.state.OptionalCurrentArray
            }
            DBUtil.addDoc(tableName, docName, doc, function () {          //add doc to firebase
                toast.success("Form for " + docName + "added successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  });
                componentRef.props.addQPopup();     
            },
                function (err) {
                    console.log('Error', err);
                });
        // }
        // else {
        //     this.InvalidMessage = "*Please Fill the blank fields !";
        //     return this.InvalidMessage;
        // }
    }
    render() {
        const { Form, formValue } = this.state;
        return (
            <div className="animated fadeIn">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="12">
                            <Card className="mx-12">
                                <CardBody className="p-6">

                                    <FormGroup row>
                                        <Col xs="12" md="8">
                                                <h1><i class="fa fa-list"></i>  {this.state.formValue}</h1>                                           
                                                                                           
                                        </Col>
                                        <Col md="4">
                                            <h4> <Badge color="primary" onClick={this.onAddQuestion} pill> <i className="icon-note"></i> Add Question</Badge></h4>
                                            <h6 style={{color : "red"}}>{this.InvalidMessage}</h6>
                                        </Col>
                                    </FormGroup >
                                    <FormGroup row>
                                        <Col xs="12" >
                                            {/* {ShareInput} */}
                                            {this.onFormSelectValue(this.state.CurrentForm)}
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Col xs="6" md="3" >
                                            <Button type="submit" size="md" color="primary" onClick={this.onSubmit}  >Submit</Button>
                                        </Col>
                                        <Col md="3">
                                            <Button type="reset" size="md" color="danger" onClick={this.onReset}><i className="fa fa-ban"></i> Reset</Button>
                                        </Col>
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
export default QuestionsForm;

