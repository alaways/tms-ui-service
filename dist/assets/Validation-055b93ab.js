import{a as y,r as v,s as F,f as a,j as e,L as k}from"./index-a90aa29c.js";import{C as c}from"./Highlight-6c84f10c.js";import{c as f,a as r,b as w}from"./object-7405de1d.js";import{F as u,a as p,c as i}from"./formik.esm-c4fd04ca.js";import{S}from"./sweetalert2.all-ca2d1030.js";import{I as C}from"./IconBell-88435c10.js";import{I as n}from"./IconCode-d140125d.js";import"./_defineProperty-6dbd93ca.js";import"./_baseIsEqual-06123cd3.js";import"./isObjectLike-b76e75a8.js";import"./isSymbol-15555f2d.js";const U=()=>{const g=y();v.useEffect(()=>{g(F("Validation"))});const d=()=>{S.mixin({toast:!0,position:"top",showConfirmButton:!1,timer:3e3}).fire({icon:"success",title:"Form submitted successfully",padding:"10px 20px"})},b=f().shape({firstname:r().required("Please fill the first name"),lastname:r().required("Please fill the last name"),username:r().required("Please choose a userName"),city:r().required("Please provide a valid city"),state:r().required("Please provide a valid state"),zip:r().required("Please provide a valid zip"),agree:w().oneOf([!0],"You must agree before submitting.")}),h=f().shape({fullName:r().required("Please fill the Name"),email:r().email("Invalid email").required("Please fill the Email"),color:r().required("Please Select the field"),firstname:r().required("Please fill the first name"),lastname:r().required("Please fill the last name"),username:r().required("Please choose a userName"),city:r().required("Please provide a valid city"),state:r().required("Please provide a valid state"),zip:r().required("Please provide a valid zip"),agree:r().required("You must agree before submitting."),select:r().required("Please Select the field")}),[m,N]=v.useState([]),o=t=>{m.includes(t)?N(s=>s.filter(l=>l!==t)):N([...m,t])};return a("div",{children:[a("ul",{className:"flex space-x-2 rtl:space-x-reverse",children:[e("li",{children:e(k,{to:"#",className:"text-primary hover:underline",children:"Forms"})}),e("li",{className:"before:content-['/'] ltr:before:mr-2 rtl:before:ml-2",children:e("span",{children:"Validation"})})]}),a("div",{className:"pt-5 space-y-8",children:[a("div",{className:"panel p-3 flex items-center text-primary overflow-x-auto whitespace-nowrap",children:[e("div",{className:"ring-2 ring-primary/30 rounded-full bg-primary text-white p-1.5 ltr:mr-3 rtl:ml-3",children:e(C,{})}),e("span",{className:"ltr:mr-3 rtl:ml-3",children:"Documentation: "}),e("a",{href:"https://www.npmjs.com/package/formik",target:"_blank",className:"block hover:underline",rel:"noreferrer",children:"https://www.npmjs.com/package/formik"})]}),a("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-6",children:[a("div",{className:"panel",id:"basic",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Basic"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>o("code1"),children:a("span",{className:"flex items-center",children:[e(n,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(u,{initialValues:{fullName:""},validationSchema:h,onSubmit:()=>{},children:({errors:t,submitCount:s,touched:l})=>a(p,{className:"space-y-5",children:[a("div",{className:s?t.fullName?"has-error":"has-success":"",children:[e("label",{htmlFor:"fullName",children:"Full Name "}),e(i,{name:"fullName",type:"text",id:"fullName",placeholder:"Enter Full Name",className:"form-input"}),s?t.fullName?e("div",{className:"text-danger mt-1",children:t.fullName}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]}),e("button",{type:"submit",className:"btn btn-primary !mt-6",onClick:()=>{l.fullName&&!t.fullName&&d()},children:"Submit Form"})]})})}),m.includes("code1")&&e(c,{children:e("pre",{className:"language-typescript",children:`import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
const submitForm = () => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        padding: '10px 20px',
    });
};

const SubmittedForm = Yup.object().shape({
    fullName: Yup.string().required('Please fill the Name'),
});

<Formik
    initialValues={{
        fullName: '',
    }}
    validationSchema={SubmittedForm}
    onSubmit={() => {}}
>
    {({ errors, submitCount, touched }) => (
        <Form className="space-y-5">
            <div className={submitCount ? (errors.fullName ? 'has-error' : 'has-success') : ''}>
                <label htmlFor="fullName">Full Name </label>
                <Field name="fullName" type="text" id="fullName" placeholder="Enter Full Name" className="form-input" />

                {submitCount ? errors.fullName ? <div className="text-danger mt-1">{errors.fullName}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
            </div>
            <button
                type="submit"
                className="btn btn-primary !mt-6"
                onClick={() => {
                    if (touched.fullName && !errors.fullName) {
                        submitForm();
                    }
                }}
            >
                Submit Form
            </button>
        </Form>
    )}
</Formik>`})})]}),a("div",{className:"panel",id:"email",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Email"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>o("code2"),children:a("span",{className:"flex items-center",children:[e(n,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(u,{initialValues:{email:""},validationSchema:h,onSubmit:()=>{},children:({errors:t,submitCount:s,touched:l})=>a(p,{className:"space-y-5",children:[a("div",{className:s?t.email?"has-error":"has-success":"",children:[e("label",{htmlFor:"Email",children:"Email"}),e(i,{name:"email",type:"text",id:"Email",placeholder:"Enter Email",className:"form-input"}),s?t.email?e("div",{className:"text-danger mt-1",children:t.email}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]}),e("button",{type:"submit",className:"btn btn-primary !mt-6",onClick:()=>{l.email&&!t.email&&d()},children:"Submit Form"})]})})}),m.includes("code2")&&e(c,{children:e("pre",{className:"language-typescript",children:`import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
const submitForm = () => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        padding: '10px 20px',
    });
};

const SubmittedForm = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Please fill the Email'),
});

<Formik
    initialValues={{
        email: '',
    }}
    validationSchema={SubmittedForm}
    onSubmit={() => {}}
>
    {({ errors, submitCount, touched }) => (
        <Form className="space-y-5">
            <div className={submitCount ? (errors.email ? 'has-error' : 'has-success') : ''}>
                <label htmlFor="Email">Email</label>
                <Field name="email" type="text" id="Email" placeholder="Enter Email" className="form-input" />

                {submitCount ? errors.email ? <div className="text-danger mt-1">{errors.email}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
            </div>
            <button
                type="submit"
                className="btn btn-primary !mt-6"
                onClick={() => {
                    if (touched.email && !errors.email) {
                        submitForm();
                    }
                }}
            >
                Submit Form
            </button>
        </Form>
    )}
</Formik>`})})]}),a("div",{className:"panel",id:"select",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Select"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>o("code3"),children:a("span",{className:"flex items-center",children:[e(n,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(u,{initialValues:{select:""},validationSchema:h,onSubmit:()=>{},children:({errors:t,submitCount:s,touched:l})=>a(p,{className:"space-y-5",children:[a("div",{className:s?t.select?"has-error":"has-success":"",children:[a(i,{as:"select",name:"select",className:"form-select",children:[e("option",{value:"",children:"Open this select menu"}),e("option",{value:"One",children:"One"}),e("option",{value:"Two",children:"Two"}),e("option",{value:"Three",children:"Three"})]}),s?t.select?e("div",{className:" text-danger mt-1",children:t.select}):e("div",{className:" text-[#1abc9c] mt-1",children:"Example valid custom select feedback"}):""]}),e("button",{type:"submit",className:"btn btn-primary !mt-6",onClick:()=>{l.select&&!t.select&&d()},children:"Submit Form"})]})})}),m.includes("code3")&&e(c,{children:e("pre",{className:"language-typescript",children:`import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
const submitForm = () => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        padding: '10px 20px',
    });
};

const SubmittedForm = Yup.object().shape({
    select: Yup.string().required('Please Select the field'),
});

<Formik
    initialValues={{
        select: '',
    }}
    validationSchema={SubmittedForm}
    onSubmit={() => {}}
>
    {({ errors, submitCount, touched }) => (
        <Form className="space-y-5">
            <div className={submitCount ? (errors.select ? 'has-error' : 'has-success') : ''}>
                <Field as="select" name="select" className="form-select">
                    <option value="">Open this select menu</option>
                    <option value="One">One</option>
                    <option value="Two">Two</option>
                    <option value="Three">Three</option>
                </Field>
                {submitCount ? (
                    errors.select ? (
                        <div className=" text-danger mt-1">{errors.select}</div>
                    ) : (
                        <div className=" text-[#1abc9c] mt-1">Example valid custom select feedback</div>
                    )
                ) : (
                    ''
                )}
            </div>
            <button
                type="submit"
                className="btn btn-primary !mt-6"
                onClick={() => {
                    if (touched.select && !errors.select) {
                        submitForm();
                    }
                }}
            >
                Submit Form
            </button>
        </Form>
    )}
</Formik>`})})]}),a("div",{className:"panel",id:"custom_styles",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Custom Styles"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>o("code4"),children:a("span",{className:"flex items-center",children:[e(n,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(u,{initialValues:{firstname:"Shaun",lastname:"Park",username:"",city:"",state:"",zip:"",agree:!1},validationSchema:b,onSubmit:()=>{},children:({errors:t,submitCount:s,touched:l,values:x})=>a(p,{className:"space-y-5",children:[a("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-5",children:[a("div",{className:s?t.firstname?"has-error":"has-success":"",children:[e("label",{htmlFor:"firstname",children:"First Name "}),e(i,{name:"firstname",type:"text",id:"firstname",placeholder:"Enter First Name",className:"form-input"}),s?t.firstname?e("div",{className:"text-danger mt-1",children:t.firstname}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]}),a("div",{className:s?t.lastname?"has-error":"has-success":"",children:[e("label",{htmlFor:"fullName",children:"Last Name "}),e(i,{name:"lastname",type:"text",id:"lastname",placeholder:"Enter Last Name",className:"form-input"}),s?t.lastname?e("div",{className:"text-danger mt-1",children:t.lastname}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]}),a("div",{className:s?t.username?"has-error":"has-success":"",children:[e("label",{htmlFor:"username",children:"Username"}),a("div",{className:"flex",children:[e("div",{className:"bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]",children:"@"}),e(i,{name:"username",type:"text",id:"username",placeholder:"Enter Username",className:"form-input ltr:rounded-l-none rtl:rounded-r-none"})]}),s?t.username?e("div",{className:"text-danger mt-1",children:t.username}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]})]}),a("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-5",children:[a("div",{className:`md:col-span-2 ${s?t.city?"has-error":"has-success":""}`,children:[e("label",{htmlFor:"customeCity",children:"City"}),e(i,{name:"city",type:"text",id:"city",placeholder:"Enter City",className:"form-input"}),s?t.city?e("div",{className:"text-danger mt-1",children:t.city}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]}),a("div",{className:s?t.state?"has-error":"has-success":"",children:[e("label",{htmlFor:"customeState",children:"State"}),e(i,{name:"state",type:"text",id:"customeState",placeholder:"Enter State",className:"form-input"}),s?t.state?e("div",{className:"text-danger mt-1",children:t.state}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]}),a("div",{className:s?t.zip?"has-error":"has-success":"",children:[e("label",{htmlFor:"customeZip",children:"Zip"}),e(i,{name:"zip",type:"text",id:"customeZip",placeholder:"Enter Zip",className:"form-input"}),s?t.zip?e("div",{className:"text-danger mt-1",children:t.zip}):e("div",{className:"text-success mt-1",children:"Looks Good!"}):""]})]}),a("div",{className:s?t.agree?"has-error":"has-success":"",children:[a("div",{className:"flex",children:[e(i,{name:"agree",id:"agree",type:"checkbox",className:"form-checkbox"}),x.agree,e("label",{htmlFor:"agree",className:"text-white-dark font-semibold",children:"Agree to terms and conditions"})]}),s&&t.agree?e("div",{className:"text-danger mt-1",children:t.agree}):""]}),e("button",{type:"submit",className:"btn btn-primary !mt-6",onClick:()=>{Object.keys(l).length!==0&&Object.keys(t).length===0&&d()},children:"Submit Form"})]})})}),m.includes("code4")&&e(c,{children:e("pre",{className:"language-typescript",children:`import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
const submitForm = () => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        padding: '10px 20px',
    });
};

const submitForm4 = Yup.object().shape({
    firstname: Yup.string().required('Please fill the first name'),
    lastname: Yup.string().required('Please fill the last name'),
    username: Yup.string().required('Please choose a userName'),
    city: Yup.string().required('Please provide a valid city'),
    state: Yup.string().required('Please provide a valid state'),
    zip: Yup.string().required('Please provide a valid zip'),
    agree: Yup.bool().oneOf([true], 'You must agree before submitting.'),
});

<Formik
    initialValues={{
        firstname: 'Shaun',
        lastname: 'Park',
        username: '',
        city: '',
        state: '',
        zip: '',
        agree: false,
    }}
    validationSchema={submitForm4}
    onSubmit={() => {}}
>
    {({ errors, submitCount, touched, values }) => (
        <Form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className={submitCount ? (errors.firstname ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="firstname">First Name </label>
                    <Field name="firstname" type="text" id="firstname" placeholder="Enter First Name" className="form-input" />

                    {submitCount ? (
                        errors.firstname ? (
                            <div className="text-danger mt-1">{errors.firstname}</div>
                        ) : (
                            <div className="text-success mt-1">Looks Good!</div>
                        )
                    ) : (
                        ''
                    )}
                </div>

                <div className={submitCount ? (errors.lastname ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="fullName">Last Name </label>
                    <Field name="lastname" type="text" id="lastname" placeholder="Enter Last Name" className="form-input" />

                    {submitCount ? errors.lastname ? <div className="text-danger mt-1">{errors.lastname}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
                </div>

                <div className={submitCount ? (errors.username ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="username">Username</label>
                    <div className="flex">
                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            @
                        </div>
                        <Field name="username" type="text" id="username" placeholder="Enter Username" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                    </div>
                    {submitCount ? errors.username ? <div className="text-danger mt-1">{errors.username}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className={\`md:col-span-2 \${submitCount ? (errors.city ? 'has-error' : 'has-success') : ''}\`}>
                    <label htmlFor="customeCity">City</label>
                    <Field name="city" type="text" id="city" placeholder="Enter City" className="form-input" />

                    {submitCount ? errors.city ? <div className="text-danger mt-1">{errors.city}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
                </div>

                <div className={submitCount ? (errors.state ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="customeState">State</label>
                    <Field name="state" type="text" id="customeState" placeholder="Enter State" className="form-input" />
                    {submitCount ? errors.state ? <div className="text-danger mt-1">{errors.state}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
                </div>

                <div className={submitCount ? (errors.zip ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="customeZip">Zip</label>
                    <Field name="zip" type="text" id="customeZip" placeholder="Enter Zip" className="form-input" />
                    {submitCount ? errors.zip ? <div className="text-danger mt-1">{errors.zip}</div> : <div className="text-success mt-1">Looks Good!</div> : ''}
                </div>
            </div>

            <div className={submitCount ? (errors.agree ? 'has-error' : 'has-success') : ''}>
                <div className="flex">
                    <Field name="agree" id="agree" type="checkbox" className="form-checkbox" />
                    {values.agree}
                    <label htmlFor="agree" className="text-white-dark font-semibold">
                        Agree to terms and conditions
                    </label>
                </div>
                {submitCount ? errors.agree ? <div className="text-danger mt-1">{errors.agree}</div> : '' : ''}
            </div>

            <button
                type="submit"
                className="btn btn-primary !mt-6"
                onClick={() => {
                    if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                        submitForm();
                    }
                }}
            >
                Submit Form
            </button>
        </Form>
    )}
</Formik>`})})]}),a("div",{className:"panel",id:"browser_default",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Browser Default"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>o("code5"),children:a("span",{className:"flex items-center",children:[e(n,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:a("form",{className:"space-y-5",onSubmit:t=>{t.preventDefault(),d()},children:[a("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-5",children:[a("div",{children:[e("label",{htmlFor:"browserFname",children:"First Name"}),e("input",{id:"browserFname",type:"text",placeholder:"Enter First Name",className:"form-input",required:!0})]}),a("div",{children:[e("label",{htmlFor:"browserLname",children:"Last name"}),e("input",{id:"browserLname",type:"text",placeholder:"Enter Last name",className:"form-input",required:!0})]}),a("div",{children:[e("label",{htmlFor:"browserEmail",children:"Username"}),a("div",{className:"flex",children:[e("div",{className:"bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]",children:"@"}),e("input",{id:"browserEmail",type:"text",placeholder:"Enter Username",className:"form-input ltr:rounded-l-none rtl:rounded-r-none",required:!0})]})]})]}),a("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-5",children:[a("div",{className:"md:col-span-2",children:[e("label",{htmlFor:"browserCity",children:"City"}),e("input",{id:"browserCity",type:"text",placeholder:"Enter City",className:"form-input",required:!0})]}),a("div",{children:[e("label",{htmlFor:"browserState",children:"State"}),e("input",{id:"browserState",type:"text",placeholder:"Enter State",className:"form-input",required:!0})]}),a("div",{children:[e("label",{htmlFor:"browserZip",children:"Zip"}),e("input",{id:"browserZip",type:"text",placeholder:"Enter Zip",className:"form-input",required:!0})]})]}),a("div",{className:"flex items-center cursor-pointer mt-1",children:[e("input",{type:"checkbox",id:"agree1",className:"form-checkbox",required:!0}),e("label",{htmlFor:"agree1",className:"text-white-dark font-semibold mb-0",children:"Agree to terms and conditions"})]}),e("button",{type:"submit",className:"btn btn-primary !mt-6",children:"Submit Form"})]})}),m.includes("code5")&&e(c,{children:e("pre",{className:"language-typescript",children:`import Swal from 'sweetalert2';
const submitForm = () => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        padding: '10px 20px',
    });
};

<form
    className="space-y-5"
    onSubmit={(e) => {
        e.preventDefault();
        submitForm();
    }}
>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
            <label htmlFor="browserFname">First Name</label>
            <input id="browserFname" type="text" placeholder="Enter First Name" className="form-input" required />
        </div>
        <div>
            <label htmlFor="browserLname">Last name</label>
            <input id="browserLname" type="text" placeholder="Enter Last name" className="form-input" required />
        </div>
        <div>
            <label htmlFor="browserEmail">Username</label>
            <div className="flex">
                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                    @
                </div>
                <input id="browserEmail" type="text" placeholder="Enter Username" className="form-input ltr:rounded-l-none rtl:rounded-r-none" required />
            </div>
        </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-2">
            <label htmlFor="browserCity">City</label>
            <input id="browserCity" type="text" placeholder="Enter City" className="form-input" required />
        </div>
        <div>
            <label htmlFor="browserState">State</label>
            <input id="browserState" type="text" placeholder="Enter State" className="form-input" required />
        </div>
        <div>
            <label htmlFor="browserZip">Zip</label>
            <input id="browserZip" type="text" placeholder="Enter Zip" className="form-input" required />
        </div>
    </div>
    <div className="flex items-center cursor-pointer mt-1">
        <input type="checkbox" id="agree1 className="form-checkbox" required />
        <label htmlFor="agree1" className="text-white-dark font-semibold mb-0">Agree to terms and conditions</label>
    </div>
    <button type="submit" className="btn btn-primary !mt-6">
        Submit Form
    </button>
</form>`})})]}),a("div",{className:"panel",id:"tooltips",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Tooltips"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>o("code6"),children:a("span",{className:"flex items-center",children:[e(n,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(u,{initialValues:{firstname:"Shaun",lastname:"Park",username:"",city:"",state:"",zip:"",agree:!1},validationSchema:b,onSubmit:()=>{},children:({errors:t,submitCount:s,touched:l})=>a(p,{className:"space-y-5",children:[a("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-5",children:[a("div",{className:s?t.firstname?"has-error":"has-success":"",children:[e("label",{htmlFor:"firstname",children:"First Name "}),e(i,{name:"firstname",type:"text",id:"firstname",placeholder:"Enter First Name",className:"form-input mb-2"}),s?t.firstname?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.firstname}):e("div",{className:"text-white bg-[#1abc9c] py-1 px-2 rounded inline-block",children:"Looks Good!"}):""]}),a("div",{className:s?t.lastname?"has-error":"has-success":"",children:[e("label",{htmlFor:"lastName",children:"Last name "}),e(i,{name:"lastname",type:"text",id:"lastname",placeholder:"Enter Last Name",className:"form-input mb-2"}),s?t.lastname?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.lastname}):e("div",{className:"text-white bg-[#1abc9c] py-1 px-2 rounded inline-block",children:"Looks Good!"}):""]}),a("div",{className:s?t.username?"has-error":"has-success":"",children:[e("label",{htmlFor:"username",children:"Username"}),a("div",{className:"flex",children:[e("div",{className:"bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]",children:"@"}),e(i,{name:"username",type:"text",id:"username",placeholder:"Enter Username",className:"form-input ltr:rounded-l-none rtl:rounded-r-none"})]}),e("div",{className:"mt-2",children:s?t.username?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.username}):e("div",{className:"text-white bg-[#1abc9c] py-1 px-2 rounded inline-block",children:"Looks Good!"}):""})]})]}),a("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-5",children:[a("div",{className:`md:col-span-2 ${s?t.city?"has-error":"has-success":""}`,children:[e("label",{htmlFor:"customeCity",children:"City"}),e(i,{name:"city",type:"text",id:"city",placeholder:"Enter City",className:"form-input mb-2"}),s?t.city?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.city}):e("div",{className:"text-white bg-[#1abc9c] py-1 px-2 rounded inline-block",children:"Looks Good!"}):""]}),a("div",{className:s?t.state?"has-error":"has-success":"",children:[e("label",{htmlFor:"customeState",children:"State"}),e(i,{name:"state",type:"text",id:"customeState",placeholder:"Enter State",className:"form-input mb-2"}),s?t.state?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.state}):e("div",{className:"text-white bg-[#1abc9c] py-1 px-2 rounded inline-block",children:"Looks Good!"}):""]}),a("div",{className:s?t.zip?"has-error":"has-success":"",children:[e("label",{htmlFor:"customeZip",children:"Zip"}),e(i,{name:"zip",type:"text",id:"customeZip",placeholder:"Enter Zip",className:"form-input mb-2"}),s?t.zip?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.zip}):e("div",{className:"text-white bg-[#1abc9c] py-1 px-2 rounded inline-block",children:"Looks Good!"}):""]})]}),a("div",{className:s?t.agree?"has-error":"has-success":"",children:[a("div",{className:"flex",children:[e(i,{name:"agree",id:"agree2",type:"checkbox",className:"form-checkbox"}),e("label",{htmlFor:"agree2",className:"text-white-dark font-semibold",children:"Agree to terms and conditions"})]}),e("div",{className:"mt-2",children:s&&t.agree?e("div",{className:"text-white bg-danger py-1 px-2 rounded inline-block",children:t.agree}):""})]}),e("button",{type:"submit",className:"btn btn-primary !mt-6",onClick:()=>{Object.keys(l).length!==0&&Object.keys(t).length===0&&d()},children:"Submit Form"})]})})}),m.includes("code6")&&e(c,{children:e("pre",{className:"language-typescript",children:`import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
const submitForm = () => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        padding: '10px 20px',
    });
};

const submitForm4 = Yup.object().shape({
    firstname: Yup.string().required('Please fill the first name'),
    lastname: Yup.string().required('Please fill the last name'),
    username: Yup.string().required('Please choose a userName'),
    city: Yup.string().required('Please provide a valid city'),
    state: Yup.string().required('Please provide a valid state'),
    zip: Yup.string().required('Please provide a valid zip'),
    agree: Yup.bool().oneOf([true], 'You must agree before submitting.'),
});

<Formik
    initialValues={{
        firstname: 'Shaun',
        lastname: 'Park',
        username: '',
        city: '',
        state: '',
        zip: '',
        agree: false,
    }}
    validationSchema={submitForm4}
    onSubmit={() => {}}
>
    {({ errors, submitCount, touched }) => (
        <Form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className={submitCount ? (errors.firstname ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="firstname">First Name </label>
                    <Field name="firstname" type="text" id="firstname" placeholder="Enter First Name" className="form-input mb-2" />

                    {submitCount ? (
                        errors.firstname ? (
                            <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.firstname}</div>
                        ) : (
                            <div className="text-white bg-[#1abc9c] py-1 px-2 rounded inline-block">Looks Good!</div>
                        )
                    ) : (
                        ''
                    )}
                </div>

                <div className={submitCount ? (errors.lastname ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="lastName">Last name </label>
                    <Field name="lastname" type="text" id="lastname" placeholder="Enter Last Name" className="form-input mb-2" />

                    {submitCount ? (
                        errors.lastname ? (
                            <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.lastname}</div>
                        ) : (
                            <div className="text-white bg-[#1abc9c] py-1 px-2 rounded inline-block">Looks Good!</div>
                        )
                    ) : (
                        ''
                    )}
                </div>

                <div className={submitCount ? (errors.username ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="username">Username</label>
                    <div className="flex">
                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            @
                        </div>

                        <Field name="username" type="text" id="username" placeholder="Enter Username" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                    </div>
                    <div className="mt-2">
                        {submitCount ? (
                            errors.username ? (
                                <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.username}</div>
                            ) : (
                                <div className="text-white bg-[#1abc9c] py-1 px-2 rounded inline-block">Looks Good!</div>
                            )
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className={\`md:col-span-2 \${submitCount ? (errors.city ? 'has-error' : 'has-success') : ''}\`}>
                    <label htmlFor="customeCity">City</label>
                    <Field name="city" type="text" id="city" placeholder="Enter City" className="form-input mb-2" />

                    {submitCount ? (
                        errors.city ? (
                            <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.city}</div>
                        ) : (
                            <div className="text-white bg-[#1abc9c] py-1 px-2 rounded inline-block">Looks Good!</div>
                        )
                    ) : (
                        ''
                    )}
                </div>

                <div className={submitCount ? (errors.state ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="customeState">State</label>
                    <Field name="state" type="text" id="customeState" placeholder="Enter State" className="form-input mb-2" />
                    {submitCount ? (
                        errors.state ? (
                            <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.state}</div>
                        ) : (
                            <div className="text-white bg-[#1abc9c] py-1 px-2 rounded inline-block">Looks Good!</div>
                        )
                    ) : (
                        ''
                    )}
                </div>

                <div className={submitCount ? (errors.zip ? 'has-error' : 'has-success') : ''}>
                    <label htmlFor="customeZip">Zip</label>
                    <Field name="zip" type="text" id="customeZip" placeholder="Enter Zip" className="form-input mb-2" />
                    {submitCount ? (
                        errors.zip ? (
                            <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.zip}</div>
                        ) : (
                            <div className="text-white bg-[#1abc9c] py-1 px-2 rounded inline-block">Looks Good!</div>
                        )
                    ) : (
                        ''
                    )}
                </div>
            </div>

            <div className={submitCount ? (errors.agree ? 'has-error' : 'has-success') : ''}>
                <div className="flex">
                    <Field name="agree" id="agree2" type="checkbox" className="form-checkbox" />
                    <label htmlFor="agree2" className="text-white-dark font-semibold">
                        Agree to terms and conditions
                    </label>
                </div>
                <div className="mt-2">
                    {submitCount ? errors.agree ? <div className="text-white bg-danger py-1 px-2 rounded inline-block">{errors.agree}</div> : '' : ''}
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary !mt-6"
                onClick={() => {
                    if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                        submitForm();
                    }
                }}
            >
                Submit Form
            </button>
        </Form>
    )}
</Formik>`})})]})]})]})]})};export{U as default};
