import{a as k,r as m,s as U,f as a,j as e,L}from"./index-a90aa29c.js";import{C as v}from"./Highlight-6c84f10c.js";import{_}from"./index-f89ea186.js";import{I as F}from"./IconBell-88435c10.js";import{I as b}from"./IconCode-d140125d.js";import{I as S}from"./IconX-54a3093e.js";const M=()=>{const N=k();m.useEffect(()=>{N(U("File Upload Preview"))});const[t,c]=m.useState([]),r=i=>{t.includes(i)?c(l=>l.filter(o=>o!==i)):c([...t,i])},[d,g]=m.useState([]),[u,p]=m.useState([]),f=69,I=(i,l)=>{g(i)},w=(i,l)=>{p(i)};return a("div",{children:[a("ul",{className:"flex space-x-2 rtl:space-x-reverse",children:[e("li",{children:e(L,{to:"#",className:"text-primary hover:underline",children:"Forms"})}),e("li",{className:"before:content-['/'] ltr:before:mr-2 rtl:before:ml-2",children:e("span",{children:"File Upload"})})]}),a("div",{className:"pt-5 space-y-8",children:[a("div",{className:"panel p-3 flex items-center text-primary overflow-x-auto whitespace-nowrap",children:[e("div",{className:"ring-2 ring-primary/30 rounded-full bg-primary text-white p-1.5 ltr:mr-3 rtl:ml-3",children:e(F,{})}),e("span",{className:"ltr:mr-3 rtl:ml-3",children:"Documentation: "}),e("a",{href:"https://www.npmjs.com/package/react-images-uploading",target:"_blank",className:"block hover:underline",rel:"noreferrer",children:"https://www.npmjs.com/package/react-images-uploading"})]}),a("div",{className:"grid lg:grid-cols-2 grid-cols-1 gap-6",children:[a("div",{className:"panel",id:"single_file",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Single File Upload"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>r("code1"),children:a("span",{className:"flex items-center",children:[e(b,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:a("div",{className:"custom-file-container","data-upload-id":"myFirstImage",children:[a("div",{className:"label-container",children:[e("label",{children:"Upload "}),e("button",{type:"button",className:"custom-file-container__image-clear",title:"Clear Image",onClick:()=>{g([])},children:"×"})]}),e("label",{className:"custom-file-container__custom-file"}),e("input",{type:"file",className:"custom-file-container__custom-file__custom-file-input",accept:"image/*"}),e("input",{type:"hidden",name:"MAX_FILE_SIZE",value:"10485760"}),e(_,{value:d,onChange:I,maxNumber:f,children:({imageList:i,onImageUpload:l,onImageRemoveAll:o,onImageUpdate:x,onImageRemove:h,isDragging:y,dragProps:C})=>a("div",{className:"upload__image-wrapper",children:[e("button",{className:"custom-file-container__custom-file__custom-file-control",onClick:l,children:"Choose File..."})," ",i.map((n,s)=>e("div",{className:"custom-file-container__image-preview relative",children:e("img",{src:n.dataURL,alt:"img",className:"m-auto"})},s))]})}),d.length===0?e("img",{src:"/assets/images/file-preview.svg",className:"max-w-md w-full m-auto",alt:""}):""]})}),t.includes("code1")&&e(v,{children:e("pre",{className:"language-typescript",children:`import { useEffect, useState } from 'react';
import 'file-upload-with-preview/dist/file-upload-with-preview.min.css';
import ImageUploading, { ImageListType } from 'react-images-uploading';

const [images, setImages] = useState<any>([]);
const maxNumber = 69;

const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    setImages(imageList as never[]);
};

<div className="custom-file-container" data-upload-id="myFirstImage">
    <div className="label-container">
        <label>Upload </label>
        <button
            type="button"
            className="custom-file-container__image-clear"
            title="Clear Image"
            onClick={() => {
                setImages([]);
            }}
        >
            ×
        </button>
    </div>
    <label className="custom-file-container__custom-file"></label>
    <input type="file" className="custom-file-container__custom-file__custom-file-input" accept="image/*" />
    <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
    <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
            <div className="upload__image-wrapper">
                <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload}>
                    Choose File...
                </button>
                &nbsp;
                {imageList.map((image, index) => (
                    <div key={index} className="custom-file-container__image-preview relative">
                        <img src={image.dataURL} alt="img" className="m-auto" />
                    </div>
                ))}
            </div>
        )}
    </ImageUploading>
    {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
</div>`})})]}),a("div",{className:"multiple-file-upload panel",children:[a("div",{className:"flex items-center justify-between mb-5",children:[e("h5",{className:"font-semibold text-lg dark:text-white-light",children:"Multiple File"}),e("button",{type:"button",className:"font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600",onClick:()=>r("code2"),children:a("span",{className:"flex items-center",children:[e(b,{className:"me-2"}),"Code"]})})]}),e("div",{className:"mb-5",children:a("div",{className:"custom-file-container","data-upload-id":"mySecondImage",children:[a("div",{className:"label-container",children:[e("label",{children:"Upload "}),e("button",{type:"button",className:"custom-file-container__image-clear",title:"Clear Image",onClick:()=>{p([])},children:"×"})]}),e("label",{className:"custom-file-container__custom-file"}),e("input",{type:"file",className:"custom-file-container__custom-file__custom-file-input",accept:"image/*"}),e("input",{type:"hidden",name:"MAX_FILE_SIZE",value:"10485760"}),e(_,{multiple:!0,value:u,onChange:w,maxNumber:f,children:({imageList:i,onImageUpload:l,onImageRemoveAll:o,onImageUpdate:x,onImageRemove:h,isDragging:y,dragProps:C})=>a("div",{className:"upload__image-wrapper",children:[e("button",{className:"custom-file-container__custom-file__custom-file-control",onClick:l,children:"Choose File..."})," ",e("div",{className:"grid gap-4 sm:grid-cols-3 grid-cols-1",children:i.map((n,s)=>a("div",{className:"custom-file-container__image-preview relative",children:[e("button",{type:"button",className:"custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-0.5 absolute top-0 left-0",title:"Clear Image",onClick:()=>h(s),children:e(S,{className:"w-3 h-3"})}),e("img",{src:n.dataURL,alt:"img",className:"object-cover shadow rounded w-full !max-h-48"})]},s))})]})}),u.length===0?e("img",{src:"/assets/images/file-preview.svg",className:"max-w-md w-full m-auto",alt:""}):""]})}),t.includes("code2")&&e(v,{children:e("pre",{className:"language-typescript",children:`import { useEffect, useState } from 'react';
import 'file-upload-with-preview/dist/file-upload-with-preview.min.css';
import ImageUploading, { ImageListType } from 'react-images-uploading';

const [images2, setImages2] = useState<any>([]);
const maxNumber = 69;

const onChange2 = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    setImages2(imageList as never[]);
};

<div className="custom-file-container" data-upload-id="mySecondImage">
    <div className="label-container">
        <label>Upload </label>
        <button
            type="button"
            className="custom-file-container__image-clear"
            title="Clear Image"
            onClick={() => {
                setImages2([]);
            }}
        >
            ×
        </button>
    </div>
    <label className="custom-file-container__custom-file"></label>
    <input type="file" className="custom-file-container__custom-file__custom-file-input" accept="image/*" />
    <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
    <ImageUploading multiple value={images2} onChange={onChange2} maxNumber={maxNumber}>
        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
            <div className="upload__image-wrapper">
                <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload}>
                    Choose File...
                </button>
                &nbsp;
                <div className="grid gap-4 sm:grid-cols-3 grid-cols-1">
                    {imageList.map((image, index) => (
                        <div key={index} className="custom-file-container__image-preview relative">
                            <button
                                type="button"
                                className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-0.5 absolute top-0 left-0"
                                title="Clear Image"
                                onClick={() => onImageRemove(index)}
                            >
                                <svg>...</svg>
                            </button>
                            <img src={image.dataURL} alt="img" className="object-cover shadow rounded w-full !max-h-48" />
                        </div>
                    ))}
                </div>
            </div>
        )}
    </ImageUploading>
    {images2.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
</div>`})})]})]})]})]})};export{M as default};
