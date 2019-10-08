import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import BootstrapTable from "react-bootstrap-table-next";
import { navigate } from "@reach/router"

import { useFetch } from "../hooks.js";

import {PrettyPrintJson, LabeledValue, LabeledValueList} from "./Widgets.js"

import {GanttChart} from "./GanttChart.js"

import TaskDetailModal from "./TaskDetailModal.js"
import NextflowLogModal from "./NextflowLogModal.js"

import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

const timeConversion = (millisec) => {
        var seconds = (millisec / 1000).toFixed(1);
        var minutes = (millisec / (1000 * 60)).toFixed(1);
        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " Sec";
        } else if (minutes < 60) {
            return minutes + " Min";
        } else if (hours < 24) {
            return hours + " Hrs";
        } else {
            return days + " Days"
        }
}

const runtimeDisplay = (cell, row) => {
    return row.trace.realtime
        ? timeConversion(row.trace.realtime)
        : timeConversion(new Date() - row.trace.submit)
}

const TaskTable = ({ data, handleClick }) => {
    const columns = [
        {
            dataField: "id", // primary key
            dummy: true,
            hidden: true
        },
        {
            dataField: "task_id",
            text: "Task ID",
            headerStyle: { width: "10%" }
        },
        {
            dataField: "trace.hash",
            text: "Nextflow hash",
            headerStyle: { width: "10%" }
        },
        {
            dataField: "trace.name",
            text: "Process",
            headerStyle: { width: "10%" }
        },
        {
            dataField: "trace.container",
            text: "Container",
            headerStyle: { width: "20%" }
        },
        {
            dataField: "trace.status",
            text: "Status",
            headerStyle: { width: "20%" }
        },
        {
            text: "Run Time",
            headerStyle: { width: "20%" },
            formatter: runtimeDisplay
        },
        {
            dataField: "trace.attempt",
            text: "Attempt",
            headerStyle: { width: "20%" }
        }
    ];
    return <BootstrapTable
                keyField="id"
                data={data}
                columns={columns}
                rowEvents={{
                    onClick: (e, row, rowIndex) => handleClick(row)
                }}
                rowStyle={{cursor: "pointer"}}
                hover={true}
                bootstrap4={true}
                bordered={false}
                condensed
                noDataIndication="No tasks to list"
            />
}

function WorkflowDetailView({ runArn }) {
    document.title = "Workflow Detail"
    const [runData, runDataIsLoading, runDataisError] = useFetch(`/api/v1/workflow/${runArn}`);
    const [taskData, taskDataIsLoading, taskDataisError] = useFetch(`/api/v1/workflow/${runArn}/tasks`);
    const [taskModalData, setTaskModalData] = useState(false);
    const [nextflowModalData, setNextflowModalData] = useState(false);

    if (runDataIsLoading || taskDataIsLoading) {
        return <div>Loading</div>
    }
    const statusString = runData.metadataField.workflow.complete
        ? "COMPLETE" // nextflow finished
        : runData.metadataField.workflow.start
            ? "RUNNING" // nextflow is running
            : runData.info.lastStatus // e.g., "PROVISIONING" from ECS

    const runTime = timeConversion(new Date() - Date.parse(runData.metadataField.workflow.start))
    return (
        <Container fluid style={{minHeight:1800}}>
        <h2>Workflow Detail</h2>

        <Row>
        <Col md='7' sm="12">
            <div className="workflow-detail-well" >
                <Row>
                    <Col md="4" sm="12">
                        <LabeledValue label="Run Name" value={
                            <span>
                                <b>{runData.metadataField.workflow.runName}</b><br/>
                                <span style={{color: "#aaa", fontSize: "10pt"}}>ARN: {runData.taskArn}</span>
                            </span>
                        } />
                    </Col>
                    <Col md="5" sm="12">
                        <LabeledValue label="Started at" value={runData.createdAt} inline />
                        {statusString == "COMPLETE" ? <LabeledValue label="Finished at" value="TODO" inline /> : null}
                        <LabeledValue label="Runtime" value={runTime} inline />
                    </Col>
                    <Col md="3" sm="12" style={{textAlign: "right"}}>
                        <h3 style={{marginTop: 4, marginRight: 10}}>{statusString}</h3>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <LabeledValue label="Nextflow Command" value={<pre>{runData.metadataField.workflow.commandLine}</pre>} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <LabeledValue label="Work Directory" value={<pre>{runData.metadataField.workflow.workDir}</pre>} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <LabeledValueList label="Workflow Parameters" values={runData.metadataField.parameters} />
                    </Col>
                </Row>
            </div>
        </Col>
        <Col md="2">
            <Button variant="outline-primary" style={{width: "100%"}} onClick={() => setNextflowModalData({workflowTaskArn: runData.taskArn})} >
                View Nextflow Logs
            </Button>
            <Button variant="outline-primary mt-3" style={{width: "100%"}} disabled>
                Open Work Directory
            </Button>
            <Button variant="outline-primary mt-3" style={{width: "100%"}} disabled>
                View Script and Config Files
            </Button>
        </Col>
        </Row>
        <Row>
            <Col md="9">
                <Tabs defaultActiveKey="list" id="tasks-detail-tabs" transition={false} >
                  <Tab eventKey="list" title="Task List">
                    <TaskTable data={taskData} handleClick={setTaskModalData}/>
                  </Tab>
                  <Tab eventKey="gannt" title="Gannt View">
                    <GanttChart taskData={taskData} workflowStart={Date.parse(runData.metadataField.workflow.start)}/>
                  </Tab>
                  <Tab eventKey="raw" title="Raw">
                    <PrettyPrintJson data={taskData} />
                  </Tab>
                </Tabs>
            </Col>
        </Row>
        <TaskDetailModal 
            data={taskModalData}
            showHandler={setTaskModalData}
        />
        <NextflowLogModal
            data={nextflowModalData}
            showHandler={setNextflowModalData}
        />
        </Container>
    )    
}

export default WorkflowDetailView;
