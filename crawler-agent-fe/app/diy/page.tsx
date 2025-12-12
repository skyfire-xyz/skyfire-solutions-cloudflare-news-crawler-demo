"use client"

import { useState } from "react"

import PageLayout from "../components/PageLayout"
import TopBar from "../components/TopBar"

const CLOUDFLARE_URLS = [
  {
    name: "API Gateway",
    url: "https://mock-news-cloudflare-api-gateway-demo.skyfire.xyz/",
  },
  {
    name: "API Gateway + WAF",
    url: "https://mock-news-cloudflare-api-gateway-waf-demo.skyfire.xyz/",
  },
  {
    name: "CDN",
    url: "https://mock-news-cloudflare-cdn-demo.skyfire.xyz/",
  },
  {
    name: "CDN + WAF",
    url: "https://mock-news-cloudflare-cdn-waf1-demo.skyfire.xyz/",
  },
]

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition flex items-center gap-1"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

export default function DIYPage() {
  const [selectedCloudflare, setSelectedCloudflare] = useState<string>(CLOUDFLARE_URLS[0].url)
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)

  const step1Curl = `curl "${selectedCloudflare}"`

  const step3Curl = `curl --request POST \\
  --url https://api.skyfire.xyz/api/v1/tokens \\
  --header 'skyfire-api-key: YOUR_API_KEY' \\
  --header 'content-type: application/json' \\
  --data '{
  "type": "kya",
  "buyerTag": "",
  "sellerServiceId": "51bcabe1-c699-474e-bc35-9840b248da52"
}'`

  const step4Curl = `curl "${selectedCloudflare}" \\
  --header "skyfire-pay-id: KYA_TOKEN"`

  return (
    <>
      <TopBar />
      <PageLayout>
        <div className="bg-blue-10 rounded-lg p-4 shadow-sm">
          <div className="max-w-5xl mx-auto w-full">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Cloudflare product
              </label>
              <div
                className="relative max-w-md"
                tabIndex={0}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              >
                <button
                  type="button"
                  onClick={() => setDropdownOpen((s) => !s)}
                  className="w-full text-left rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm flex items-center justify-between"
                >
                  <span className="truncate">
                    {CLOUDFLARE_URLS.find((a) => a.url === selectedCloudflare)?.name}
                  </span>
                  <svg
                    className="h-4 w-4 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                    {CLOUDFLARE_URLS.map((item) => (
                      <div
                        key={item.url}
                        className="cursor-pointer border-b px-4 py-3 last:border-b-0 hover:bg-gray-50"
                        onMouseDown={() => {
                          // use onMouseDown so we set before blur
                          setSelectedCloudflare(item.url)
                          setDropdownOpen(false)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              <>
                {/* Step 1 */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Step 1: Try accessing protected website without token
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This demonstrates that the protected website blocks requests
                    without proper authentication. You&apos;ll receive a 403
                    error response - Missing KYAPay token in the skyfire-pay-id header. Please 
                    create an account at https://app.skyfire.xyz and 
                    create a kya token - https://docs.skyfire.xyz/reference/create-token and 
                    include it in your request in the skyfire-pay-id header.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto relative">
                    <CopyButton text={step1Curl} />
                    <pre className="whitespace-pre-wrap break-all pr-20">
                      {step1Curl}
                    </pre>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Step 2: Create Skyfire account and get Buyer Agent API key
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md">
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                      <li>
                        Go to{" "}
                        <a
                          href="https://app.skyfire.xyz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        >
                          app.skyfire.xyz
                        </a>{" "}
                        and create an account (if you don&apos;t have one)
                      </li>
                      <li>
                        Navigate to the API Keys section in your dashboard
                      </li>
                      <li>
                        Create a new <strong>Buyer Agent API key</strong>
                      </li>
                      <li>
                        Copy the API key and save it securely - you&apos;ll need
                        it for the next step
                      </li>
                      <li>
                        For detailed instructions, refer to the{" "}
                        <a
                          href="https://docs.skyfire.xyz/docs/introduction"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        >
                          Skyfire Platform Guide
                        </a>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Step 3: Create KYA token via Skyfire API
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Call the Skyfire API directly to create a KYA (Know Your
                    Agent) token. This token will be used to authenticate your
                    requests and grant access to the protected website. Replace{" "}
                    <code className="bg-gray-200 px-1 rounded">
                      YOUR_API_KEY
                    </code>{" "}
                    with your Buyer Agent API key from Step 2.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto relative">
                    <CopyButton text={step3Curl} />
                    <pre className="whitespace-pre-wrap break-all pr-20">
                      {step3Curl}
                    </pre>
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Parameters explained:</strong>
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>
                        <code className="bg-white px-1 rounded">type</code>: Set
                        to &quot;kya&quot; for Know Your Agent token
                      </li>
                      <li>
                        <code className="bg-white px-1 rounded">buyerTag</code>:
                        Optional identifier for your organization
                      </li>
                      <li>
                        <code className="bg-white px-1 rounded">
                          sellerServiceId
                        </code>
                        : Crawler service ID
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Expected Response:</strong> You&apos;ll receive a
                      JSON response containing a token field. Copy the entire
                      JWT token value for use in Step 4.
                    </p>
                    <code className="block mt-2 text-sm text-gray-800 bg-white p-2 rounded border">
                      {`{ "token": "eyJhbGciOiJFUzI1NiIsImtpZCI6IjAiLCJ0eXAiOiJreWErSldUIn0..." }`}
                    </code>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Step 4: Access protected website with token
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Now use the KYA token
                    from Step 3 to access the protected website. Replace{" "}
                    <code className="bg-gray-200 px-1 rounded">KYA_TOKEN</code>{" "}
                    with the actual KYA token you received. The request will
                    successfully access the protected site using the{" "}
                    <code className="bg-gray-200 px-1 rounded">
                      skyfire-pay-id
                    </code>{" "}
                    header.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto relative">
                    <CopyButton text={step4Curl} />
                    <pre className="whitespace-pre-wrap break-all pr-20">
                      {step4Curl}
                    </pre>
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> The{" "}
                      <code className="bg-white px-1 rounded">
                        skyfire-pay-id
                      </code>{" "}
                      header contains your KYA token and authenticates your
                      request to the protected service. This header is
                      automatically validated by Cloudflare Worker to verify your
                      agent&apos;s identity and authorization.
                    </p>
                  </div>
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Success!</strong> With a valid KYA token in the{" "}
                      <code className="bg-white px-1 rounded">
                        skyfire-pay-id
                      </code>{" "}
                      header, you can now access the protected website and
                      retrieve the data. You should receive the HTML content of
                      the page instead of a 403 error.
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    🎉 You&apos;ve completed the DIY tutorial!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    You&apos;ve successfully learned how to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Create a Skyfire Buyer Agent API key</li>
                    <li>Generate KYA tokens for authentication</li>
                    <li>
                      Use tokens to access protected websites programmatically
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                      For more advanced usage and integration options, visit the{" "}
                      <a
                        href="https://docs.skyfire.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        Skyfire Documentation
                      </a>
                    </p>
                  </div>
                </div>
              </>
          </div>
        </div>
      </PageLayout>
    </>
  )
}

