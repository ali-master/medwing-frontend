import React from "react";
import { Modal, Form, Icon, Input } from "antd";
import propTypes from "prop-types";
import { merge, isEmpty } from "ramda";

const HandleMarker = ({ isNew, visible, onSubmit, onCancel, initialData, form }) => {
	const title = `${isNew ? "Add" : "Edit"} item`;
	const id = isNew
		? Math.random()
				.toString(16)
				.slice(2)
		: initialData.id;
	const { getFieldDecorator } = form;
	const handleSubmit = () => {
		form.validateFields((err, values) => {
			if (!err) {
				const finalFormValue = merge({ id })(values);

				onSubmit(finalFormValue);
			}
		});
	};

	return (
		<Modal title={title} centered visible={visible} okText="Submit" onOk={handleSubmit} onCancel={onCancel}>
			<Form className="login-form">
				<Form.Item>
					{getFieldDecorator("title", {
						...(isEmpty(initialData) ? {} : { initialValue: initialData.title }),
						rules: [{ required: true, message: "Please enter title!" }],
					})(<Input prefix={<Icon type="file-text" css={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Title" />)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator("description", {
						...(isEmpty(initialData) ? {} : { initialValue: initialData.description }),
						rules: [{ required: true, message: "Please enter description!" }],
					})(<Input prefix={<Icon type="message" css={{ color: "rgba(0,0,0,.25)" }} />} type="text" placeholder="Description" />)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator("lat", {
						...(isEmpty(initialData) ? {} : { initialValue: +initialData.lat }),
						rules: [
							{
								type: "number",
								required: true,
								min: -90,
								max: 90,
								message: "Please enter a valid latitude!",
								transform(value) {
									return +value;
								},
							},
						],
					})(<Input prefix={<Icon type="pushpin" css={{ color: "rgba(0,0,0,.25)" }} />} type="number" placeholder="Latitude" />)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator("lng", {
						...(isEmpty(initialData) ? {} : { initialValue: +initialData.lng }),
						rules: [
							{
								type: "number",
								required: true,
								min: -180,
								max: 180,
								message: "Please enter a valid longitude!",
								transform(value) {
									return +value;
								},
							},
						],
					})(<Input prefix={<Icon type="pushpin" css={{ color: "rgba(0,0,0,.25)" }} />} type="number" placeholder="Longitude" />)}
				</Form.Item>
			</Form>
		</Modal>
	);
};

HandleMarker.propTypes = {
	isNew: propTypes.bool,
	visible: propTypes.bool,
	initialData: propTypes.object,
	onSubmit: propTypes.func.isRequired,
	onCancel: propTypes.func.isRequired,
};

HandleMarker.defaultProps = {
	isNew: true,
	visible: false,
	initialData: {},
};

export default Form.create({ name: "handle_marker" })(HandleMarker);
