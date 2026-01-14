import{a as N,r as u,s as x,f as l,j as e,L as y}from"./index-a90aa29c.js";import{C as s}from"./Highlight-6c84f10c.js";import{S as i}from"./react-select.esm-b46d9623.js";import{I as w}from"./IconBell-88435c10.js";import{I as r}from"./IconCode-d140125d.js";import"./createSuper-98fcd92d.js";import"./floating-ui.dom-0aeb9e8a.js";const D=()=>{const h=N();u.useEffect(()=>{h(x("Select2"))});const[a,c]=u.useState([]),t=o=>{a.includes(o)?c(v=>v.filter(f=>f!==o)):c([...a,o])},n=[{value:"orange",label:"Orange"},{value:"white",label:"White"},{value:"purple",label:"Purple"}],d=[{value:"group1",label:"Group 1",isDisabled:"option--is-disabled"},{value:"orange",label:"Orange"},{value:"white",label:"White"},{value:"purple",label:"Purple"},{value:"group2",label:"Group 2",isDisabled:"option--is-disabled"},{value:"yellow",label:"Yellow"},{value:"green",label:"Green"},{value:"red",label:"Red"},{value:"group3",label:"Group 3",isDisabled:"option--is-disabled"},{value:"aqua",label:"Aqua"},{value:"black",label:"Black"},{value:"blue",label:"Blue"}],p=[{value:"orange",label:"Orange"},{value:"white",label:"White",isDisabled:"option--is-disabled"},{value:"purple",label:"Purple"}],m=[{value:"orange",label:"Orange"},{value:"white",label:"White"},{value:"purple",label:"Purple"}],b=[{value:"orange",label:"Orange"},{value:"white",label:"White"},{value:"purple",label:"Purple"}],g=[{value:"orange",label:"Orange"},{value:"white",label:"White"},{value:"purple",label:"Purple"}];return l("div",{children:[l("ul",{className:"flex space-x-2 rtl:space-x-reverse",children:[e("li",{children:e(y,{to:"#",className:"text-primary hover:underline",children:"Forms"})}),e("li",{className:"before:content-['/'] ltr:before:mr-2 rtl:before:ml-2",children:e("span",{children:"Select2"})})]}),l("div",{className:"pt-5 space-y-8",children:[l("div",{className:"panel p-3 flex items-center text-primary overflow-x-auto whitespace-nowrap",children:[e("div",{className:"ring-2 ring-primary/30 rounded-full bg-primary text-white p-1.5 ltr:mr-3 rtl:ml-3",children:e(w,{})}),e("span",{className:"ltr:mr-3 rtl:ml-3",children:"Documentation: "}),e("a",{href:"https://www.npmjs.com/package/react-select",target:"_blank",className:"block hover:underline",rel:"noreferrer",children:"https://www.npmjs.com/package/react-select"})]}),l("div",{className:"grid lg:grid-cols-2 grid-cols-1 gap-6 custom-select",children:[l("div",{className:"panel",id:"basic",children:[l("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Basic"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>t("code1"),children:l("span",{className:"flex items-center",children:[e(r,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(i,{defaultValue:n[0],options:n,isSearchable:!1})}),a.includes("code1")&&e(s,{children:e("pre",{className:"language-typescript",children:`import Select from 'react-select';

const options = [
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White' },
    { value: 'purple', label: 'Purple' },
];

<Select defaultValue={options[0]} options={options} isSearchable={false} />`})})]}),l("div",{className:"panel",id:"nested",children:[l("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Nested"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>t("code2"),children:l("span",{className:"flex items-center",children:[e(r,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(i,{defaultValue:d[1],options:d,isSearchable:!1})}),a.includes("code2")&&e(s,{children:e("pre",{className:"language-typescript",children:`import Select from 'react-select';

const options1 = [
    { value: 'group1', label: 'Group 1', isDisabled: 'option--is-disabled' },
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White' },
    { value: 'purple', label: 'Purple' },
    { value: 'group2', label: 'Group 2', isDisabled: 'option--is-disabled' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'group3', label: 'Group 3', isDisabled: 'option--is-disabled' },
    { value: 'aqua', label: 'Aqua' },
    { value: 'black', label: 'Black' },
    { value: 'blue', label: 'Blue' },
];

<Select defaultValue={options1[1]} options={options1} isSearchable={false}/>`})})]}),l("div",{className:"panel",id:"disabling_options",children:[l("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Disabling options"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>t("code3"),children:l("span",{className:"flex items-center",children:[e(r,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(i,{defaultValue:p[0],options:p,isSearchable:!1})}),a.includes("code3")&&e(s,{children:e("pre",{className:"language-typescript",children:`import Select from 'react-select';

const options2 = [
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White', isDisabled: 'option--is-disabled' },
    { value: 'purple', label: 'Purple' },
];

<Select defaultValue={options2[0]} options={options2} isSearchable={false}/>`})})]}),l("div",{className:"panel",id:"tagging",children:[l("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Searchable"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>t("code5"),children:l("span",{className:"flex items-center",children:[e(r,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(i,{placeholder:"Select an option",options:b})}),a.includes("code5")&&e(s,{children:e("pre",{className:"language-typescript",children:`import Select from 'react-select';

const options3 = [
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White' },
    { value: 'purple', label: 'Purple' },
];

<Select placeholder="Select an option" options={options4} />`})})]}),l("div",{className:"panel",id:"placeholder",children:[l("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Placeholder"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>t("code4"),children:l("span",{className:"flex items-center",children:[e(r,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(i,{placeholder:"Choose...",options:m,isSearchable:!1})}),a.includes("code4")&&e(s,{children:e("pre",{className:"language-typescript",children:`import Select from 'react-select';

const options4 = [
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White' },
    { value: 'purple', label: 'Purple' },
];

<Select placeholder="Choose..." options={options3} isSearchable={false}/>`})})]}),l("div",{className:"panel",id:"limit_tagging",children:[l("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Multiple select"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>t("code6"),children:l("span",{className:"flex items-center",children:[e(r,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:e(i,{placeholder:"Select an option",options:g,isMulti:!0,isSearchable:!1})}),a.includes("code6")&&e(s,{children:e("pre",{className:"language-typescript",children:`import Select from 'react-select';

const options5 = [
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White' },
    { value: 'purple', label: 'Purple' },
];

<Select placeholder="Select an option" options={options5} isMulti isSearchable={false}/>`})})]})]})]})]})};export{D as default};
