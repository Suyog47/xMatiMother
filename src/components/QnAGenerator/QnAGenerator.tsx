import React, { useState } from 'react';
import { InputGroup, Button, TextArea } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://www.app.xmati.ai/apis';

const QnAGenerator: React.FC = () => {
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_URL}/qna-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            
            // Format the data as Question and Answer pairs
            let formattedContent = '';
            const qnas = result.data?.qnas || [];
            
            if (Array.isArray(qnas) && qnas.length > 0) {
                qnas.forEach((item: any, index: number) => {
                    const questions = item.data?.questions?.en || [];
                    const answers = item.data?.answers?.en || [];
                    
                    formattedContent += `Q${index + 1}: ${questions.join(', ')}\n\n`;
                    formattedContent += `A${index + 1}: ${answers.join(' ')}\n\n`;
                    formattedContent += '---\n\n';
                });
            } else {
                formattedContent = JSON.stringify(result.data, null, 2);
            }

            console.log(JSON.stringify(result.data, null, 2));
            
            setContent(formattedContent);
        } catch (error) {
            console.error('Error occurred while scraping:', error);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                padding: '24px',
                boxSizing: 'border-box',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e7ef 100%)',
            }}
        >
            {/* First Container - URL Input (30% height) */}
            <div
                style={{
                    height: '30%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '24px',
                }}
            >
                <h1
                    style={{
                        fontSize: '28px',
                        fontWeight: 600,
                        color: '#2d3748',
                        marginBottom: '15px',
                    }}
                >
                    xMati QnA Generator
                </h1>

                <div
                    style={{
                        width: '100%',
                        maxWidth: '800px',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '12px',
                        alignItems: 'center',
                    }}
                >
                    <InputGroup
                        large
                        placeholder="Enter URL here..."
                        value={url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                        style={{
                            flex: 1,
                            width: '100vh'
                        }}
                    />
                    <Button
                        large
                        intent="primary"
                        text="Submit"
                        onClick={handleSubmit}
                        style={{
                            minWidth: '120px',
                            height: '40px',
                        }}
                    />
                </div>
            </div>

            {/* Second Container - Output Display (70% height) */}
            <div
                style={{
                    height: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                }}
            >
                <TextArea
                    readOnly
                    fill
                    growVertically={false}
                    value={content}
                    style={{
                        height: '100%',
                        resize: 'none',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e0',
                        background: '#f7fafc',
                        overflow: 'auto',
                    }}
                    placeholder="Generated Q&A will appear here..."
                />
            </div>
        </div>
    );
};

export default QnAGenerator;
