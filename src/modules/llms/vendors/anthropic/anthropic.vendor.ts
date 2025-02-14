import { backendCaps } from '~/modules/backend/state-backend';

import { AnthropicIcon } from '~/common/components/icons/AnthropicIcon';
import { apiAsync, apiQuery } from '~/common/util/trpc.client';

import type { AnthropicAccessSchema } from '../../server/anthropic/anthropic.router';
import type { IModelVendor } from '../IModelVendor';
import type { VChatMessageOut } from '../../llm.client';
import { unifiedStreamingClient } from '../unifiedStreamingClient';

import { LLMOptionsOpenAI } from '../openai/openai.vendor';
import { OpenAILLMOptions } from '../openai/OpenAILLMOptions';

import { AnthropicSourceSetup } from './AnthropicSourceSetup';


// special symbols
export const isValidAnthropicApiKey = (apiKey?: string) => !!apiKey && (apiKey.startsWith('sk-') ? apiKey.length >= 39 : apiKey.length >= 40);

export interface SourceSetupAnthropic {
  anthropicKey: string;
  anthropicHost: string;
  heliconeKey: string;
}

export const ModelVendorAnthropic: IModelVendor<SourceSetupAnthropic, AnthropicAccessSchema, LLMOptionsOpenAI> = {
  id: 'anthropic',
  name: 'Anthropic',
  rank: 13,
  location: 'cloud',
  instanceLimit: 1,
  hasBackendCap: () => backendCaps().hasLlmAnthropic,

  // components
  Icon: AnthropicIcon,
  SourceSetupComponent: AnthropicSourceSetup,
  LLMOptionsComponent: OpenAILLMOptions,

  // functions
  getTransportAccess: (partialSetup): AnthropicAccessSchema => ({
    dialect: 'anthropic',
    anthropicKey: partialSetup?.anthropicKey || '',
    anthropicHost: partialSetup?.anthropicHost || null,
    heliconeKey: partialSetup?.heliconeKey || null,
  }),


  // List Models
  rpcUpdateModelsQuery: (access, enabled, onSuccess) => {
    return apiQuery.llmAnthropic.listModels.useQuery({ access }, {
      enabled: enabled,
      onSuccess: onSuccess,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    });
  },

  // Chat Generate (non-streaming) with Functions
  rpcChatGenerateOrThrow: async (access, llmOptions, messages, functions, forceFunctionName, maxTokens) => {
    if (functions?.length || forceFunctionName)
      throw new Error('Anthropic does not support functions');

    const { llmRef, llmTemperature = 0.5, llmResponseTokens } = llmOptions;
    try {
      return await apiAsync.llmAnthropic.chatGenerate.mutate({
        access,
        model: {
          id: llmRef!,
          temperature: llmTemperature,
          maxTokens: maxTokens || llmResponseTokens || 1024,
        },
        history: messages,
      }) as VChatMessageOut;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Anthropic Chat Generate Error';
      console.error(`anthropic.rpcChatGenerateOrThrow: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },

  // Chat Generate (streaming) with Functions
  streamingChatGenerateOrThrow: unifiedStreamingClient,

};
