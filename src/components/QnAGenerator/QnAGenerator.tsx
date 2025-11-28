import React, { useState } from 'react';
import { InputGroup, Button, TextArea } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import QnAGeneratorClass from './AI-call';

const packageJson = { version: '100.0.0' }

const CURRENT_VERSION = packageJson.version
const API_URL = process.env.REACT_APP_API_URL || 'https://www.app.xmati.ai/apis';

const QnAGenerator: React.FC = () => {
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qna-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setContent('');

        try {
            // Step 1: Fetch content from URL
            const response = await fetch(`${API_URL}/qna-generator`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-App-Version': CURRENT_VERSION,
                 },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch URL content: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Step 2: Format the scraped content
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

            // Step 3: Generate QnA using AI
            const generator = new QnAGeneratorClass();
            const aiResponse = await generator.generateBot(formattedContent);
            
            if (aiResponse) {
                // Convert to pretty JSON string
                setContent(JSON.stringify(aiResponse, null, 2));
            } else {
                throw new Error('AI failed to generate Q&A pairs');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Error in QnA generation process:', errorMessage);
            setError(errorMessage);
            setContent(`Error: ${errorMessage}\n\nPlease try again or check the console for more details.`);
        } finally {
            setLoading(false);
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

                {error && (
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '800px',
                            padding: '12px',
                            marginBottom: '12px',
                            backgroundColor: '#fed7d7',
                            color: '#c53030',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

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
                        text={loading ? "Generating..." : "Submit"}
                        onClick={handleSubmit}
                        disabled={loading || !url.trim()}
                        loading={loading}
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
                {/* Button Container */}
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '16px',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        icon="download"
                        text="Download Json file"
                        intent="primary"
                        onClick={handleDownload}
                        disabled={!content}
                        style={{
                            minWidth: '100px',
                        }}
                    />
                </div>

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
